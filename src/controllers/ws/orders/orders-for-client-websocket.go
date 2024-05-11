package orders

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/controllers/ws/wsutils"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/gofiber/contrib/websocket"
)

func (c *ordersController) ConnectToOrdersForClient(conn *websocket.Conn) {

	defer conn.Close()

	clientID, ok := conn.Locals(locals.USER_ID_LOCALS).(int)
	if !ok {
		fmt.Println("clientID error")
		return
	}

	fmt.Println("clientID: ", clientID)

	err := c.OrdersService.AddConnectionToOrdersForClientConnections(clientID, conn)
	if err != nil {
		return
	}
	defer c.OrdersService.RemoveConnectionFromOrdersForClientConnections(clientID, conn)

	message := make(chan wsutils.Message)
	closed := make(chan bool)
	gotPong := make(chan bool)

	go wsutils.ReadConnMessages(conn, message, closed)
	go wsutils.SendPing(conn, gotPong, closed)

	allOrders, err := c.OrdersService.GetOrdersForClient(clientID)
	if err != nil {
		return
	}

	outputOrders := make([]orderservice.WSOrderOutput, 0, len(allOrders))
	for _, order := range allOrders {
		outputOrder := orderservice.WSOrderOutput{}
		outputOrder.FillFromModel(order)
		outputOrders = append(outputOrders, outputOrder)
	}

	allOrdersMessage := orderservice.WSMessageOrderArray{
		EventType: orderservice.GET_ALL_EVENT_TYPE,
		Orders:    outputOrders,
	}

	fmt.Println("writing get all message, companyID: ", clientID)
	err = conn.WriteJSON(allOrdersMessage)
	if err != nil {
		return
	}

loop:
	for {
		select {
		case m := <-message:
			fmt.Println("Got message: ", string(m.Message))
			if string(m.Message) == wsutils.PongMessage {
				gotPong <- true
			}
		case <-closed:
			break loop
		}
	}

}
