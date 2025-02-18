package orderservice

import (
	"encoding/json"
	"fmt"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/helpers/wshelpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/orderrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
	"github.com/alexkalak/qrmenu/src/services/notificationservice"
	"github.com/alexkalak/qrmenu/src/services/osrmservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/alexkalak/qrmenu/src/services/telegramservice"
	"github.com/gofiber/contrib/websocket"
	"github.com/google/uuid"
)

type OrderService interface {
	GetAllOrders() ([]models.Order, error)
	GetAllOrdersWithSpecificStatuses(statuses ...string) ([]models.Order, error)
	GetOrdersForPub(pubID int) ([]models.Order, error)
	GetOrdersForClient(clientID int) ([]models.Order, error)
	GetOrderByID(orderID int) (models.Order, error)
	CreateOrder(models.Order) (models.Order, error)
	CreateOrderForUnknownClient(models.Order) (models.Order, error)
	UpdateOrderStatus(orderID int, status string) error
	UpdateOrderDeliveryPrice(orderID int, deliveryPrice float64) error
	UpdateOrderCourierInfo(orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error)
	UpdateOrderPrepared(orderID int, prepared bool) error
	AddToOrderCourierInfoCourierDebit(orderID int, amount float64) (models.OrderCourierInfo, error)
	IsCommissionNeededForOrderArgsIDs(orderID int, pubID int) (bool, error)
	IsCommissionNeededForOrderArgsModels(order models.Order, pub models.Pub) (bool, error)
	FillDishPricesForOrder(order *models.Order, addCommission bool) error
	FillDishPrices(pubID int, inputDishes []models.OrderDish, addCommission bool) ([]models.OrderDish, error)
	UpdateOrderDishes(orderID int, newOrderDishes []models.OrderDish) error

	RateOrder(orderID int, rating int) error

	SubscribeOnOrderUpdates(callback func(order models.Order, sendTelegram bool))

	AddConnectionToOrdersForPubConnections(pubID int, conn *websocket.Conn) error
	AddConnectionToOrdersForClientConnections(pubID int, conn *websocket.Conn) error

	RemoveConnectionFromOrdersForPubConnections(pubID int, conn *websocket.Conn) error
	RemoveConnectionFromOrdersForClientConnections(pubID int, conn *websocket.Conn) error
}

type orderService struct {
	DistanceService                 osrmservice.OsrmService
	OrderRepo                       orderrepo.OrderRepo
	ClientRepo                      clientrepo.ClientRepo
	PubService                      pubservice.PubService
	WebSocketPubConnections         wshelpers.ConnectionsForID
	WebSocketClientConnections      wshelpers.ConnectionsForID
	PubsRepo                        pubsrepo.PubsRepo
	RoleRepo                        rolerepo.RoleRepo
	TelegramService                 telegramservice.TelegramService
	NotificationService             notificationservice.NotificationService
	SubsribedOnOrdersUpdateCallback []func(order models.Order, sendTelegram bool)
}

var singleton *orderService = nil

func New() OrderService {
	if singleton == nil {
		singleton = &orderService{
			DistanceService:     osrmservice.New(),
			PubsRepo:            pubsrepo.New(),
			PubService:          pubservice.New(),
			OrderRepo:           orderrepo.New(),
			ClientRepo:          clientrepo.New(),
			RoleRepo:            rolerepo.New(),
			NotificationService: notificationservice.New(),
			WebSocketPubConnections: wshelpers.ConnectionsForID{
				Connections: map[int]wshelpers.ConnectionsSet{},
			},
			WebSocketClientConnections: wshelpers.ConnectionsForID{
				Connections: map[int]wshelpers.ConnectionsSet{},
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

func (s *orderService) GetAllOrders() ([]models.Order, error) {
	return s.OrderRepo.GetAllOrders()
}
func (s *orderService) GetAllOrdersWithSpecificStatuses(statuses ...string) ([]models.Order, error) {
	return s.OrderRepo.GetAllOrdersWithSpecificStatuses(statuses...)
}

func (s *orderService) SubscribeOnOrderUpdates(callback func(order models.Order, sendTelegram bool)) {
	s.SubsribedOnOrdersUpdateCallback = append(s.SubsribedOnOrdersUpdateCallback, callback)
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

func (s *orderService) IsCommissionNeededForOrderArgsIDs(orderID int, pubID int) (bool, error) {
	pub, err := s.PubsRepo.GetPubById(pubID)
	if err != nil {
		return false, err
	}
	order, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return false, err
	}

	return order.OrderType == models.DELIVERY_ORDER_TYPE && pub.Shipping.AddCommissionToDishPrices, nil
}

func (s *orderService) IsCommissionNeededForOrderArgsModels(order models.Order, pub models.Pub) (bool, error) {
	return order.OrderType == models.DELIVERY_ORDER_TYPE && pub.Shipping.AddCommissionToDishPrices, nil
}

func (s *orderService) FillDishPricesForOrder(order *models.Order, addCommission bool) error {
	if order == nil {
		return servererrors.ErrInternalServerError
	}

	dishesWithoutPrices, err := order.GetDishes()
	if err != nil {
		return err
	}

	dishesForOrder, err := s.FillDishPrices(order.PubID, dishesWithoutPrices, addCommission)
	if err != nil {
		return err
	}

	dishesForOrderJSON, err := json.Marshal(dishesForOrder)
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	order.DishesJSON = string(dishesForOrderJSON)

	dishesTotalPrice, err := s.CalculateOrderDishesTotalPrice(*order)
	if err != nil {
		return err
	}

	//adding total dishes price wihthout commission field to order
	commissionInFraction := float64(models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT) / 100

	dishesTotalPriceWithoutCommission := dishesTotalPrice / float64(1+commissionInFraction)
	fmt.Println("dishes total price without commission: ", dishesTotalPriceWithoutCommission)

	order.TotalDishesPriceWithoutCommission = dishesTotalPriceWithoutCommission
	//

	return nil
}

func (s *orderService) FillDishPrices(pubID int, inputDishes []models.OrderDish, addCommission bool) ([]models.OrderDish, error) {
	dishesFromDatabase, err := s.PubsRepo.GetAllDishesForPub(pubID)
	if err != nil {
		return nil, err
	}

	dishPricesMap := make(map[int]float64)
	for _, dish := range dishesFromDatabase {
		smallestPrice := dish.Price
		if dish.SalePrice != 0 && dish.SalePrice < dish.Price {
			smallestPrice = dish.SalePrice
		}
		if addCommission {
			overprice := smallestPrice * float64(models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT) / 100
			smallestPrice += overprice
		}

		dishPricesMap[int(dish.ID)] = smallestPrice
	}

	outputDishes := make([]models.OrderDish, len(inputDishes))
	for i, dishInput := range inputDishes {
		outputDishes[i] = models.OrderDish{
			DishID:    dishInput.DishID,
			Count:     dishInput.Count,
			DishPrice: dishPricesMap[dishInput.DishID],
		}
	}

	return outputDishes, nil
}

func (s *orderService) CreateOrder(order models.Order) (models.Order, error) {
	pub, err := s.PubsRepo.GetPubById(order.PubID)
	if err != nil {
		return models.Order{}, err
	}

	addCommissionToDishes, err := s.IsCommissionNeededForOrderArgsModels(order, pub)
	if err != nil {
		return models.Order{}, err
	}

	err = s.FillDishPricesForOrder(&order, addCommissionToDishes)
	if err != nil {
		return models.Order{}, err
	}

	distance := 0

	if order.Lat != 0 && order.Lng != 0 {
		distances, err := s.DistanceService.GetDistanceToPubs(order.Lat, order.Lng, []models.Pub{pub})
		if err == nil && len(distances) == 1 {
			distance = distances[0]
		}
	}

	dishesTotalPrice, err := s.CalculateOrderDishesTotalPrice(order)
	if err != nil {
		return models.Order{}, err
	}
	fmt.Println("dishes total price: ", dishesTotalPrice)

	realDeliveryPrice, freeDeliveryPrice, err := s.GetRealDeliveryPricesForOrder(order, pub)
	if err != nil {
		return models.Order{}, err
	}

	commission := dishesTotalPrice - order.TotalDishesPriceWithoutCommission

	courierInfo := models.OrderCourierInfo{
		IsReserved:        false,
		ReserverCourierID: 0,
		CourierReward:     realDeliveryPrice, //half of commission is for courier
		CourierDebit:      commission,
		Distance:          distance,
	}

	if freeDeliveryPrice > 0 && freeDeliveryPrice < dishesTotalPrice {
		courierInfo.CourierDebit = commission - realDeliveryPrice
	}

	order.Status = models.NOT_HANDLED_ORDER_STATUS

	tx := s.OrderRepo.NewTransaction()

	order, err = s.OrderRepo.CreateOrderWithinTransaction(tx, order, courierInfo)
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

func (s *orderService) GetRealDeliveryPricesForOrder(order models.Order, pub models.Pub) (float64, float64, error) {
	return s.PubService.GetDeliveryPriceForLatLng(pub, order.Lat, order.Lng)
}

func (s *orderService) CalculateOrderDishesTotalPrice(order models.Order) (float64, error) {
	dishes, err := order.GetDishes()
	if err != nil {
		return 0, err
	}

	sum := 0.0
	for _, dishInfo := range dishes {
		sum += dishInfo.DishPrice * float64(dishInfo.Count)
	}
	return sum, nil
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

	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order)

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
		return nil
	}

	return nil
}

func (s *orderService) UpdateOrderDeliveryPrice(orderID int, deliveryPrice float64) error {
	_, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	err = s.OrderRepo.UpdateOrderDeliveryPriceWithinTransaction(tx, orderID, deliveryPrice)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order)

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

func (s *orderService) AddToOrderCourierInfoCourierDebit(orderID int, amount float64) (models.OrderCourierInfo, error) {
	order, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	if order.OrderCourierInfo.IsReserved {
		return models.OrderCourierInfo{}, ordererrors.ErrOrderIsAlreadyReserved
	}

	courierInfo := order.OrderCourierInfo
	courierInfo.CourierReward -= amount
	courierInfo.CourierDebit += amount

	updatedCourierInfo, err := s.UpdateOrderCourierInfo(orderID, courierInfo)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	return updatedCourierInfo, nil
}

func (s *orderService) UpdateOrderCourierInfo(orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error) {
	tx := s.OrderRepo.NewTransaction()

	updatedCourierInfo, err := s.OrderRepo.UpdateOrderCourierInfoWithingTransaction(tx, orderID, courierInfo)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order)

	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.OrderCourierInfo{}, err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.OrderCourierInfo{}, err
	}
	tx.Commit()

	return updatedCourierInfo, nil
}

func (s *orderService) UpdateOrderPrepared(orderID int, prepared bool) error {
	tx := s.OrderRepo.NewTransaction()
	err := s.OrderRepo.UpdateOrderPreparedWithinTransaction(tx, orderID, prepared)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacksWithoutTelegram(order)

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

func (s *orderService) UpdateOrderDishes(orderID int, orderDishes []models.OrderDish) error {
	_, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	dishesBytes, err := json.Marshal(orderDishes)
	if err != nil {
		return err
	}
	order.DishesJSON = string(dishesBytes)

	isCommissionNeeded, err := s.IsCommissionNeededForOrderArgsIDs(orderID, order.PubID)
	if err != nil {
		return err
	}

	totalPrice, err := s.CalculateOrderDishesTotalPrice(order)
	if err != nil {
		return err
	}

	err = s.FillDishPricesForOrder(&order, isCommissionNeeded)
	if err != nil {
		return err
	}

	commissionInFraction := float64(models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT) / 100
	commission := totalPrice - totalPrice/float64(1+commissionInFraction)
	fmt.Println("total dish plaksdjflkajsdlfk j= ", totalPrice)
	fmt.Println("total dish comj= ", commission)

	order.TotalDishesPriceWithoutCommission = totalPrice - commission

	if !isCommissionNeeded {
		order.TotalDishesPriceWithoutCommission = totalPrice
	}

	err = s.OrderRepo.UpdateOrderTotalPrice(orderID, order.TotalDishesPriceWithoutCommission)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	err = s.OrderRepo.UpdateOrderDishesWithinTransaction(tx, orderID, string(dishesBytes))
	if err != nil {
		return err
	}

	orderInTransaction, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	newCourierInfo := orderInTransaction.OrderCourierInfo
	newCourierInfo.CourierDebit = commission

	_, err = s.UpdateOrderCourierInfo(orderID, newCourierInfo)
	if err != nil {
		return err
	}
	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(orderInTransaction)

	//sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(orderInTransaction.PubID, orderInTransaction, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	//sending for clients
	err = s.SendSingleOrderMessageForClientConnections(orderInTransaction.ClientID, orderInTransaction, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	return nil
}

func getBodyForOrderUpdateStatusNotification(orderID int, orderStatus string) notificationservice.NotificaitonText {
	if orderStatus == models.NOT_HANDLED_ORDER_STATUS {
		return notificationservice.NotificaitonText{
			Ru: fmt.Sprintf("Заказ №%d в обработке, ожидайте ответа от ресторана", orderID),
			Ro: fmt.Sprintf("Comanda №%d este în curs de procesare, așteptați un răspuns din partea restaurantului", orderID),
		}
	}
	if orderStatus == models.PREPARING_ORDER_STATUS {
		return notificationservice.NotificaitonText{
			Ru: fmt.Sprintf("Заказ №%d готовится", orderID),
			Ro: fmt.Sprintf("Comanda №%d este în curs de pregătire", orderID),
		}
	}
	if orderStatus == models.AT_COURIER_ORDER_STATUS {
		return notificationservice.NotificaitonText{
			Ru: fmt.Sprintf("Заказ №%d передан курьеру, ожидайте звонка", orderID),
			Ro: fmt.Sprintf("Comanda №%d a fost transferată curierului, așteptați un apel", orderID),
		}
	}
	if orderStatus == models.COMPLETED_ORDER_STATUS {
		return notificationservice.NotificaitonText{
			Ru: fmt.Sprintf("Заказ №%d доставлен. Спасибо за доверие! Оцените качество сервиса", orderID),
			Ro: fmt.Sprintf("Comanda №%d a fost livrată. Vă mulțumim pentru încredere! Evaluați calitatea serviciului", orderID),
		}
	}
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

	//send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order)

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

func (s *orderService) SendUpdatedOrderToAllCallbacks(order models.Order) {
	for _, f := range s.SubsribedOnOrdersUpdateCallback {
		f(order, true)
	}
}

func (s *orderService) SendUpdatedOrderToAllCallbacksWithoutTelegram(order models.Order) {
	for _, f := range s.SubsribedOnOrdersUpdateCallback {
		f(order, false)
	}
}

func (s *orderService) SendSingleOrderMessageForPubConnections(pubID int, order models.Order, eventType EventType) error {
	connections := s.WebSocketPubConnections.Connections[pubID]
	return s.SendSingleOrderMessage(pubID, order, eventType, connections)
}

func (s *orderService) SendSingleOrderMessageForClientConnections(clientID int, order models.Order, eventType EventType) error {
	connections := s.WebSocketClientConnections.Connections[clientID]
	return s.SendSingleOrderMessage(clientID, order, eventType, connections)
}

func (s *orderService) SendSingleOrderMessage(pubID int, order models.Order, eventType EventType, connections wshelpers.ConnectionsSet) error {
	fmt.Println("connections: ", connections)
	fmt.Println("sending notifications for ", len(connections), " connections")
	for conn := range connections {
		outputOrder := entities.OrderOutput{}
		err := outputOrder.FillFromModel(order)
		if err != nil {
			return err
		}

		message := WSOrderMessage{
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

	s.WebSocketPubConnections.Mu.Lock()
	existingConnections, ok := s.WebSocketPubConnections.Connections[pubID]
	if !ok {
		existingConnections = wshelpers.ConnectionsSet{}
		s.WebSocketPubConnections.Connections[pubID] = existingConnections
	}

	existingConnections.Add(conn)
	fmt.Println("added new pub connection, allConnections: ", s.WebSocketPubConnections.Connections[pubID])

	s.WebSocketPubConnections.Mu.Unlock()
	return nil
}

func (s *orderService) AddConnectionToOrdersForClientConnections(clientID int, conn *websocket.Conn) error {
	_, err := s.ClientRepo.GetClientByID(clientID)
	if err != nil {
		return err
	}

	s.WebSocketClientConnections.Mu.Lock()
	existingConnections, ok := s.WebSocketClientConnections.Connections[clientID]
	if !ok {
		existingConnections = wshelpers.ConnectionsSet{}
		s.WebSocketClientConnections.Connections[clientID] = existingConnections
	}

	existingConnections.Add(conn)
	fmt.Println("added new client connection, allConnections: ", s.WebSocketClientConnections.Connections[clientID])

	s.WebSocketClientConnections.Mu.Unlock()
	return nil
}

func (s *orderService) RemoveConnectionFromOrdersForPubConnections(pubID int, conn *websocket.Conn) error {
	s.WebSocketPubConnections.Mu.Lock()
	s.WebSocketPubConnections.Connections[pubID].Remove(conn)
	s.WebSocketPubConnections.Mu.Unlock()
	return nil
}

func (s *orderService) RemoveConnectionFromOrdersForClientConnections(clientID int, conn *websocket.Conn) error {
	s.WebSocketClientConnections.Mu.Lock()
	s.WebSocketClientConnections.Connections[clientID].Remove(conn)
	s.WebSocketClientConnections.Mu.Unlock()
	return nil
}
