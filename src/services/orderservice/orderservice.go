package orderservice

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/orderrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
	"github.com/alexkalak/qrmenu/src/services/notificationservice"
	"github.com/alexkalak/qrmenu/src/services/telegramservice"
	"github.com/gofiber/contrib/websocket"
	"github.com/google/uuid"
)

type void interface{}

type connectionsSet map[*websocket.Conn]void

func (c connectionsSet) Add(conn *websocket.Conn) {
	_, ok := c[conn]
	if !ok {
		c[conn] = new(void)
	}
}
func (c connectionsSet) Remove(conn *websocket.Conn) {
	_, ok := c[conn]
	if !ok {
		return
	}

	delete(c, conn)
}

type ordersForPubConnections struct {
	mu sync.Mutex
	//Pub id contains websocket connections
	Connections map[int]connectionsSet
}

type ordersForClientConnections struct {
	mu sync.Mutex
	//User id contains websocket connections
	Connections map[int]connectionsSet
}

type OrderService interface {
	GetOrdersForPub(pubID int) ([]models.Order, error)
	GetOrdersForClient(clientID int) ([]models.Order, error)
	GetOrderByID(orderID int) (models.Order, error)
	CreateOrder(models.Order) (models.Order, error)
	CreateOrderForUnknownClient(models.Order) (models.Order, error)
	UpdateOrderStatus(orderID int, status string) error
	UpdateOrderDishes(orderID int, newOrderDishes []models.OrderDish) error

	RateOrder(orderID int, rating int) error

	AddConnectionToOrdersForPubConnections(pubID int, conn *websocket.Conn) error
	AddConnectionToOrdersForClientConnections(pubID int, conn *websocket.Conn) error

	RemoveConnectionFromOrdersForPubConnections(pubID int, conn *websocket.Conn) error
	RemoveConnectionFromOrdersForClientConnections(pubID int, conn *websocket.Conn) error
}

type orderService struct {
	OrderRepo                  orderrepo.OrderRepo
	ClientRepo                 clientrepo.ClientRepo
	WebSocketPubConnections    ordersForPubConnections
	WebSocketClientConnections ordersForClientConnections
	PubsRepo                   pubsrepo.PubsRepo
	RoleRepo                   rolerepo.RoleRepo
	TelegramService            telegramservice.TelegramService
	NotificationService        notificationservice.NotificationService
}

var singleton *orderService = nil

func New() OrderService {
	if singleton == nil {
		singleton = &orderService{
			PubsRepo:            pubsrepo.New(),
			OrderRepo:           orderrepo.New(),
			ClientRepo:          clientrepo.New(),
			RoleRepo:            rolerepo.New(),
			NotificationService: notificationservice.New(),
			WebSocketPubConnections: ordersForPubConnections{
				Connections: map[int]connectionsSet{},
			},
			WebSocketClientConnections: ordersForClientConnections{
				Connections: map[int]connectionsSet{},
			},
		}

		var err error
		singleton.TelegramService, err = telegramservice.New()

		if err != nil {
			singleton = nil
			fmt.Println("in orders singleton constructor")
			panic(err)
		}
	}

	return singleton
}

func (s *orderService) GetOrdersForPub(pubID int) ([]models.Order, error) {
	return s.OrderRepo.GetOrdersForPub(pubID)
}

func (s *orderService) GetOrdersForClient(clientID int) ([]models.Order, error) {
	return s.OrderRepo.GetOrdersForClient(clientID)
}

func (s *orderService) GetOrderByID(orderID int) (models.Order, error) {
	return s.OrderRepo.GetOrderByID(orderID)
}

func (s *orderService) CreateOrder(order models.Order) (models.Order, error) {
	tx := s.OrderRepo.NewTransaction()

	order.Status = models.NOT_HANDLED_ORDER_STATUS
	order, err := s.OrderRepo.CreateOrderWithinTransaction(tx, order)
	if err != nil {
		fmt.Println("creating order error")
		return models.Order{}, err
	}

	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, CREATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.Order{}, err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, CREATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.Order{}, err
	}

	tx.Commit()

	s.TelegramService.SendCreateOrderMessageForPub(order.PubID, order)

	return order, nil
}

func (s *orderService) CreateOrderForUnknownClient(order models.Order) (models.Order, error) {
	role, err := s.RoleRepo.GetRoleByName(models.CLIENT_ROLE_NAME)
	if err != nil {
		return models.Order{}, err
	}

	orderName := "order in place from web menu"
	if order.OrderType == models.DELIVERY_ORDER_TYPE {
		orderName = "delivery order from web menu"
	} else if order.OrderType == models.PREORDER_ORDER_TYPE {
		orderName = "preorder from web menu"
	}

	client, err := s.ClientRepo.CreateClient(models.Client{
		Name:   orderName,
		Phone:  uuid.New().String(),
		RoleID: int(role.ID),
	})

	if err != nil {
		return models.Order{}, err
	}

	order.ClientID = int(client.ID)

	return s.CreateOrder(order)
}

func (s *orderService) UpdateOrderStatus(orderID int, status string) error {
	err := models.CheckOrderStatusCorrectness(status)
	if err != nil {
		return err
	}

	_, err = s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	err = s.OrderRepo.UpdateOrderStatusWithinTransaction(tx, orderID, status)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	err = s.NotificationService.SendNotification(order.ClientID, getBodyForOrderUpdateStatusNotification(int(order.ID), order.Status), getTitleForOrderUpdateStatus())
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	return nil
}

func (s *orderService) UpdateOrderDishes(orderID int, orderDishes []models.OrderDish) error {
	_, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	dishesBytes, err := json.Marshal(orderDishes)
	if err != nil {
		return err
	}

	err = s.OrderRepo.UpdateOrderDishesWithinTransaction(tx, orderID, string(dishesBytes))
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	return nil
}

func getBodyForOrderUpdateStatusNotification(orderID int, orderStatus string) notificationservice.NotificaitonText {
	return notificationservice.NotificaitonText{
		Ru: fmt.Sprintf("У заказа №%d обновился статус, теперь он: %s", orderID, models.TranslateStatus(orderStatus, "ru")),
		Ro: fmt.Sprintf("Ordinul nr. %d a fost actualizat și acum este: %s", orderID, models.TranslateStatus(orderStatus, "ro")),
	}
}
func getTitleForOrderUpdateStatus() notificationservice.NotificaitonText {
	return notificationservice.NotificaitonText{
		Ru: "Обновление статуса заказа",
		Ro: "Actualizarea stării comenzii",
	}
}

func (s *orderService) RateOrder(orderID int, rating int) error {
	_, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	err = s.OrderRepo.RateOrderWithinTransaction(tx, orderID, rating)
	if err != nil {
		return ordererrors.ErrUnableToUpdateOrder
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		fmt.Println("gettign order withing transaction error")
		return err
	}
	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending admin notification error")
		return err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending client notification error")
		return err
	}

	tx.Commit()
	return nil
}

func (s *orderService) SendSingleOrderMessageForPubConnections(pubID int, order models.Order, eventType EventType) error {
	connections := s.WebSocketPubConnections.Connections[pubID]
	return s.SendSingleOrderMessage(pubID, order, eventType, connections)
}

func (s *orderService) SendSingleOrderMessageForClientConnections(pubID int, order models.Order, eventType EventType) error {
	connections := s.WebSocketClientConnections.Connections[pubID]
	return s.SendSingleOrderMessage(pubID, order, eventType, connections)
}

func (s *orderService) SendSingleOrderMessage(pubID int, order models.Order, eventType EventType, connections connectionsSet) error {
	fmt.Println("connections: ", connections)
	fmt.Println("sending notifications for ", len(connections), " connections")
	for conn := range connections {
		outputOrder := WSOrderOutput{}
		err := outputOrder.FillFromModel(order)
		if err != nil {
			return err
		}

		message := WSMessage{
			EventType: eventType,
			Order:     outputOrder,
		}

		err = conn.WriteJSON(message)
		if err != nil {
			err := conn.WriteJSON(message)
			if err != nil {
				fmt.Println("Sending order for pub error: ", err)
			}
		}
	}

	return nil
}

func (s *orderService) AddConnectionToOrdersForPubConnections(pubID int, conn *websocket.Conn) error {
	_, err := s.PubsRepo.GetPubById(pubID)
	if err != nil {
		return err
	}

	s.WebSocketPubConnections.mu.Lock()
	existingConnections, ok := s.WebSocketPubConnections.Connections[pubID]
	if !ok {
		existingConnections = connectionsSet{}
		s.WebSocketPubConnections.Connections[pubID] = existingConnections
	}

	existingConnections.Add(conn)
	fmt.Println("added new pub connection, allConnections: ", s.WebSocketPubConnections.Connections[pubID])

	s.WebSocketPubConnections.mu.Unlock()
	return nil
}

func (s *orderService) AddConnectionToOrdersForClientConnections(clientID int, conn *websocket.Conn) error {
	_, err := s.ClientRepo.GetClientByID(clientID)
	if err != nil {
		return err
	}

	s.WebSocketClientConnections.mu.Lock()
	existingConnections, ok := s.WebSocketClientConnections.Connections[clientID]
	if !ok {
		existingConnections = connectionsSet{}
		s.WebSocketClientConnections.Connections[clientID] = existingConnections
	}

	existingConnections.Add(conn)
	fmt.Println("added new client connection, allConnections: ", s.WebSocketClientConnections.Connections[clientID])

	s.WebSocketClientConnections.mu.Unlock()
	return nil
}

func (s *orderService) RemoveConnectionFromOrdersForPubConnections(pubID int, conn *websocket.Conn) error {
	s.WebSocketPubConnections.mu.Lock()
	s.WebSocketPubConnections.Connections[pubID].Remove(conn)
	s.WebSocketPubConnections.mu.Unlock()
	return nil
}

func (s *orderService) RemoveConnectionFromOrdersForClientConnections(clientID int, conn *websocket.Conn) error {
	s.WebSocketClientConnections.mu.Lock()
	s.WebSocketClientConnections.Connections[clientID].Remove(conn)
	s.WebSocketClientConnections.mu.Unlock()
	return nil
}
