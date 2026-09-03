package courierws

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/controllers/ws/wsutils"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
	"github.com/gofiber/contrib/websocket"
)

func (c *couriersController) ConnectToOrdersForCourier(conn *websocket.Conn) {
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

	userRole, ok := conn.Locals(locals.USER_ROLE_LOCALS).(string)
	if !ok {
		fmt.Println("user Role error")
		return
	}

	if userRole != models.COURIER_ROLE_NAME {
		fmt.Println("user Role is not courier")
		return
	}

	courierID, err := strconv.Atoi(conn.Params("courierID"))
	if err != nil {
		fmt.Println("companyID error")
		return
	}

	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		fmt.Println("Check access error")
		return
	}

	err = c.CourierService.AddConnectionToCourierConnections(courierID, conn)
	if err != nil {
		return
	}
	defer c.CourierService.AddConnectionToCourierConnections(courierID, conn)

	message := make(chan wsutils.Message)
	closed := make(chan bool)
	gotPong := make(chan bool)

	go wsutils.ReadConnMessages(conn, message, closed)
	go wsutils.SendPing(conn, gotPong, closed)

	availableForDeliveryOrders, err := c.CourierService.GetAllAvailableOrdersForDelivery(courierID)
	if err != nil {
		return
	}

	deliveredByCourierOrders, err := c.CourierService.GetAllCourierOrders(courierID)
	if err != nil {
		return
	}

	outputOrders := make([]entities.OrderOutput, 0, len(availableForDeliveryOrders))
	for _, order := range availableForDeliveryOrders {
		outputOrder := entities.OrderOutput{}
		outputOrder.FillFromModel(order)
		outputOrders = append(outputOrders, outputOrder)
	}
	for _, order := range deliveredByCourierOrders {
		outputOrder := entities.OrderOutput{}
		outputOrder.FillFromModel(order)
		outputOrders = append(outputOrders, outputOrder)
	}

	allOrdersMessage := courierservice.WSCourierOrdersMessage{
		EventType: courierservice.GET_ALL_EVENT_TYPE,
		Orders:    outputOrders,
	}

	fmt.Println("writing get all messages courierID: ", courierID)
	err = conn.WriteJSON(allOrdersMessage)
	if err != nil {
		fmt.Println("writing error: ", err)
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
