package orders

import (
	"fmt"
	"strconv"
	"time"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/controllers/ws/wsutils"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/gofiber/contrib/websocket"
)

type Message struct {
	MessageType int
	Message     []byte
}

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

	message := make(chan Message)
	closed := make(chan bool)
	gotPong := make(chan bool)

	go readConnMessages(conn, message, closed)
	go sendPing(conn, gotPong, closed)

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

func readConnMessages(conn *websocket.Conn, message chan<- Message, closed chan<- bool) {
	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error message ", err)
			closed <- true
			break
		}

		message <- Message{
			MessageType: mt,
			Message:     msg,
		}
	}
}

func sendPing(conn *websocket.Conn, gotPong <-chan bool, closed chan<- bool) {
	pingTicker := time.NewTicker(10 * time.Second)

	for range pingTicker.C {
		err := conn.WriteMessage(websocket.TextMessage, []byte(wsutils.PingMessage))
		if err != nil {
			closed <- true
			return
		}
		go closeConnectionIfThereWillBeNoPong(conn, gotPong, closed, pingTicker, time.Second*9)
	}
}

func closeConnectionIfThereWillBeNoPong(conn *websocket.Conn, gotPong <-chan bool, closed chan<- bool, pingTicker *time.Ticker, duration time.Duration) {
	ticker := time.NewTicker(duration)
	for {
		select {
		case b := <-gotPong:
			if b {
				return
			}
		case t := <-ticker.C:
			fmt.Println("pong ticker for closing connection: ", t)
			if conn != nil {
				closed <- true
			}

			ticker.Stop()

			if pingTicker != nil {
				pingTicker.Stop()
			}
			return
		}
	}
}
