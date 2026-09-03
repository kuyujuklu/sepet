package orderservice

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/helpers/wshelpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/modifiergrouprepo"
	"github.com/alexkalak/qrmenu/src/repo/orderrepo"
	"github.com/alexkalak/qrmenu/src/repo/orderstatuseventrepo"
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
	UpdateOrderApproximatePreparationTime(orderID int, approximatePreparationTime time.Time) error

	GetOrderStatusEvents(orderID int) ([]models.OrderStatusEvent, error)
	// Average minutes from "preparing" to "at_courier" over recent orders,
	// zone-scoped first - basedOn is "zone" when that had enough samples,
	// "pub" when it fell back to the pub-wide average instead.
	GetEstimatedPreparingMinutes(pubID int, shapeID string) (minutes float64, sampleCount int, basedOn string, err error)

	AddToOrderCourierInfoCourierDebit(orderID int, amount float64) (models.OrderCourierInfo, error)
	IsCommissionNeededForOrderArgsIDs(orderID int, pubID int) (bool, error)
	IsCommissionNeededForOrderArgsModels(order models.Order, pub models.Pub) (bool, error)
	FillDishPricesForOrder(order *models.Order, addCommission bool) error
	FillDishPrices(pubID int, inputDishes []models.OrderDish, addCommission bool) ([]models.OrderDish, error)
	UpdateOrderDishes(orderID int, newOrderDishes []models.OrderDish) error

	RateOrder(orderID int, rating int) error

	SubscribeOnOrderUpdates(callback func(newOrder models.Order, prevOrder models.Order, isNew bool))

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
	OrderStatusEventRepo            orderstatuseventrepo.OrderStatusEventRepo
	ModifierGroupRepo               modifiergrouprepo.ModifierGroupRepo
	SubsribedOnOrdersUpdateCallback []func(newOrder models.Order, prevOrder models.Order, isNew bool)
}

var singleton *orderService = nil

func New() OrderService {
	if singleton == nil {
		singleton = &orderService{
			DistanceService:     osrmservice.New(),
			PubsRepo:            pubsrepo.New(),
			PubService:          pubservice.New(),
			OrderRepo:            orderrepo.New(),
			ClientRepo:           clientrepo.New(),
			RoleRepo:             rolerepo.New(),
			NotificationService:  notificationservice.New(),
			OrderStatusEventRepo: orderstatuseventrepo.New(),
			ModifierGroupRepo:    modifiergrouprepo.New(),
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

func (s *orderService) SubscribeOnOrderUpdates(callback func(newOrder models.Order, prevOrder models.Order, isNew bool)) {
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

	// adding total dishes price wihthout commission field to order
	commissionInFraction := float64(models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT) / 100

	if !addCommission {
		commissionInFraction = 0
	}

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

	now := time.Now().UTC()
	nowMinutes := now.Hour()*60 + now.Minute()

	dishesByID := make(map[int]models.Dish)
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

		dishesByID[int(dish.ID)] = dish
		dishPricesMap[int(dish.ID)] = smallestPrice
	}

	outputDishes := make([]models.OrderDish, len(inputDishes))
	for i, dishInput := range inputDishes {
		dish, ok := dishesByID[dishInput.DishID]
		if !ok || !dish.IsAvailableNow(nowMinutes) {
			return nil, ordererrors.ErrDishNotAvailable
		}

		price := dishPricesMap[dishInput.DishID]

		if len(dishInput.ModifierOptionIDs) > 0 {
			modifierTotal, err := s.resolveModifierTotal(dishInput.DishID, dishInput.ModifierOptionIDs)
			if err != nil {
				return nil, err
			}
			price += modifierTotal
		}

		outputDishes[i] = models.OrderDish{
			DishID:            dishInput.DishID,
			Count:             dishInput.Count,
			DishPrice:         price,
			ModifierOptionIDs: dishInput.ModifierOptionIDs,
		}
	}

	return outputDishes, nil
}

// resolveModifierTotal sums the price deltas of the given modifier option
// IDs, server-resolved (never trusting a client-sent price) - and rejects
// any option that isn't actually assigned to this dish via one of its
// modifier groups, so a client can't apply a cheaper/unrelated dish's
// modifier to inflate or deflate this line's price.
func (s *orderService) resolveModifierTotal(dishID int, optionIDs []int) (float64, error) {
	options, err := s.ModifierGroupRepo.GetOptionsByIDs(optionIDs)
	if err != nil {
		return 0, err
	}
	if len(options) != len(optionIDs) {
		return 0, ordererrors.ErrInvalidModifierOption
	}

	allowedGroupIDs, err := s.ModifierGroupRepo.GetGroupIDsForDish(dishID)
	if err != nil {
		return 0, err
	}
	allowedGroupIDsSet := make(map[uint]bool, len(allowedGroupIDs))
	for _, id := range allowedGroupIDs {
		allowedGroupIDsSet[id] = true
	}

	total := 0.0
	for _, option := range options {
		if !allowedGroupIDsSet[option.ModifierGroupID] {
			return 0, ordererrors.ErrInvalidModifierOption
		}
		total += option.PriceDelta
	}

	return total, nil
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

	realDeliveryPrice, freeDeliveryPrice, shapeID, err := s.GetRealDeliveryPricesForOrder(order, pub)
	if err != nil {
		return models.Order{}, err
	}
	order.DeliveryPrice = realDeliveryPrice
	order.ShapeID = shapeID

	fmt.Println("real Price: ", realDeliveryPrice)
	fmt.Println("free delivery Price: ", freeDeliveryPrice)

	commission := dishesTotalPrice - order.TotalDishesPriceWithoutCommission

	courierInfo := models.OrderCourierInfo{
		IsReserved:        false,
		ReserverCourierID: 0,
		CourierReward:     realDeliveryPrice, // half of commission is for courier
		CourierDebit:      commission,
		Distance:          distance,
	}

	if freeDeliveryPrice > 0 && freeDeliveryPrice < dishesTotalPrice {
		courierInfo.CourierDebit = commission - realDeliveryPrice
		order.DeliveryPrice = 0
	}

	order.Status = models.NOT_HANDLED_ORDER_STATUS
	order.ApproximatePreparationTime = time.Now().Add(time.Minute * 20)

	tx := s.OrderRepo.NewTransaction()

	order, err = s.OrderRepo.CreateOrderWithinTransaction(tx, order, courierInfo)
	if err != nil {
		fmt.Println("creating order error")
		return models.Order{}, err
	}

	err = s.OrderStatusEventRepo.CreateEventWithinTransaction(tx, models.OrderStatusEvent{
		OrderID: order.ID,
		PubID:   uint(order.PubID),
		ShapeID: order.ShapeID,
		Status:  order.Status,
	})
	if err != nil {
		fmt.Println("logging initial order status event error")
		return models.Order{}, err
	}

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, CREATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.Order{}, err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, CREATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.Order{}, err
	}

	tx.Commit()

	s.TelegramService.SendCreateOrderMessageForPub(order.PubID, order)

	return order, nil
}

func (s *orderService) GetRealDeliveryPricesForOrder(order models.Order, pub models.Pub) (float64, float64, string, error) {
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

	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
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

	err = s.OrderStatusEventRepo.CreateEventWithinTransaction(tx, models.OrderStatusEvent{
		OrderID: order.ID,
		PubID:   uint(order.PubID),
		ShapeID: order.ShapeID,
		Status:  order.Status,
	})
	if err != nil {
		fmt.Println("logging order status event error")
		return err
	}

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	err = s.NotificationService.SendNotificationLinkedToOrderInfoPage(
		order.ClientID,
		getBodyForOrderUpdateStatusNotification(int(order.ID), order.Status),
		getTitleForOrderUpdateStatus(),
		orderID,
	)
	if err != nil {
		fmt.Println("sending notification error")
		return nil
	}

	return nil
}

func (s *orderService) UpdateOrderDeliveryPrice(orderID int, deliveryPrice float64) error {
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
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

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	// sending for clients
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
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	tx := s.OrderRepo.NewTransaction()

	updatedCourierInfo, err := s.OrderRepo.UpdateOrderCourierInfoWithingTransaction(tx, orderID, courierInfo)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.OrderCourierInfo{}, err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return models.OrderCourierInfo{}, err
	}
	tx.Commit()

	return updatedCourierInfo, nil
}

func (s *orderService) UpdateOrderPrepared(orderID int, prepared bool) error {
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()
	err = s.OrderRepo.UpdateOrderPreparedWithinTransaction(tx, orderID, prepared)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	return nil
}

func (s *orderService) UpdateOrderApproximatePreparationTime(orderID int, approximatePreparationTime time.Time) error {
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()
	err = s.OrderRepo.UpdateOrderApproximatePreparationTimeWithinTransaction(tx, orderID, approximatePreparationTime)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}
	tx.Commit()

	return nil
}

func (s *orderService) GetOrderStatusEvents(orderID int) ([]models.OrderStatusEvent, error) {
	return s.OrderStatusEventRepo.GetEventsForOrder(orderID)
}

// MIN_SAMPLES_FOR_ZONE_AVERAGE is deliberately small - a zone's first few
// orders would otherwise fall back to the pub-wide average for a long time,
// which defeats the point of having a per-zone number at all. Once a zone
// has this many completed preparing->at_courier pairs, its own average is
// trusted over the pub-wide one.
const MIN_SAMPLES_FOR_ZONE_AVERAGE = 5
const RECENT_ORDERS_SAMPLE_LIMIT = 20

func (s *orderService) GetEstimatedPreparingMinutes(pubID int, shapeID string) (float64, int, string, error) {
	if shapeID != "" {
		zoneResult, err := s.OrderStatusEventRepo.GetAveragePreparingToCourierMinutes(pubID, shapeID, RECENT_ORDERS_SAMPLE_LIMIT)
		if err != nil {
			return 0, 0, "", err
		}

		if zoneResult.SampleCount >= MIN_SAMPLES_FOR_ZONE_AVERAGE {
			return zoneResult.AvgMinutes, zoneResult.SampleCount, "zone", nil
		}
	}

	pubResult, err := s.OrderStatusEventRepo.GetAveragePreparingToCourierMinutes(pubID, "", RECENT_ORDERS_SAMPLE_LIMIT)
	if err != nil {
		return 0, 0, "", err
	}

	return pubResult.AvgMinutes, pubResult.SampleCount, "pub", nil
}

func (s *orderService) UpdateOrderDishes(orderID int, orderDishes []models.OrderDish) error {
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
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
	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(orderInTransaction, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(orderInTransaction.PubID, orderInTransaction, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending notification error")
		return err
	}

	// sending for clients
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
	prevOrder, err := s.OrderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	tx := s.OrderRepo.NewTransaction()

	err = s.OrderRepo.RateOrderWithinTransaction(tx, orderID, rating)
	if err != nil {
		return ordererrors.ErrUnableToUpdateOrder
	}

	orders, err := s.OrderRepo.GetAllOrdersForPubWithinTransaction(tx, prevOrder.PubID)
	if err != nil {
		return ordererrors.ErrUnableToGetOrder
	}

	newPubRating := s.CountPubRating(orders)
	err = s.PubsRepo.UpdatePubRatingWithinTransaction(tx, prevOrder.PubID, newPubRating)
	if err != nil {
		return err
	}

	order, err := s.OrderRepo.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		fmt.Println("getting order withing transaction error")
		return err
	}

	// send for all subscribed callbacks
	s.SendUpdatedOrderToAllCallbacks(order, prevOrder, false)

	// sending for admin panel
	err = s.SendSingleOrderMessageForPubConnections(order.PubID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending admin notification error")
		return err
	}

	// sending for clients
	err = s.SendSingleOrderMessageForClientConnections(order.ClientID, order, UPDATE_EVENT_TYPE)
	if err != nil {
		fmt.Println("sending client notification error")
		return err
	}

	tx.Commit()
	return nil
}

func (s *orderService) CountPubRating(orders []models.Order) float64 {
	if orders == nil || len(orders) < 3 {
		return 0
	}
	totalSum := 0
	amountOfCountedOrders := 0
	for _, order := range orders {
		if order.Rating == 0 {
			continue
		}
		amountOfCountedOrders++
		totalSum += order.Rating
	}

	return float64(totalSum) / float64(amountOfCountedOrders)
}

func (s *orderService) SendUpdatedOrderToAllCallbacks(newOrder models.Order, prevOrder models.Order, isNew bool) {
	for _, f := range s.SubsribedOnOrdersUpdateCallback {
		f(newOrder, prevOrder, isNew)
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
