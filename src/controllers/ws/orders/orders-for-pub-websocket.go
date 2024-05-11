package orders

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/controllers/ws/wsutils"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/gofiber/contrib/websocket"
)

func (c *ordersController) ConnectToOrdersForPub(conn *websocket.Conn) {

	defer conn.Close()

	userID, ok := conn.Locals(locals.USER_ID_LOCALS).(int)
	if !ok {
		fmt.Println("userID error")
		return
	}

	userSignificance, ok := conn.Locals(locals.USER_SIGNIFICANCE_LOCALS).(int)
	if !ok {
		fmt.Println("userSignificance error")
		return
	}

	companyID, err := strconv.Atoi(conn.Params("companyID"))
	if err != nil {
		fmt.Println("companyID error")
		return
	}

	pubID, err := strconv.Atoi(conn.Params("pubID"))
	if err != nil {
		fmt.Println("pubID error")
		return
	}

	fmt.Println("userID: ", userID, "companyID: ", companyID, "userSignificance: ", userSignificance, "pubID: ", pubID)
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		fmt.Println("Check access error")
		return
	}

	err = c.OrdersService.AddConnectionToOrdersForPubConnections(pubID, conn)
	if err != nil {
		return
	}
	defer c.OrdersService.RemoveConnectionFromOrdersForPubConnections(pubID, conn)

	message := make(chan wsutils.Message)
	closed := make(chan bool)
	gotPong := make(chan bool)

	go wsutils.ReadConnMessages(conn, message, closed)
	go wsutils.SendPing(conn, gotPong, closed)

	allOrders, err := c.OrdersService.GetOrdersForPub(pubID)
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

	fmt.Println("writing get all message, companyID: ", companyID)
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
