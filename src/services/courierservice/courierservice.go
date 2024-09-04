package courierservice

import (
	"errors"
	"fmt"
	"mime/multipart"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/autherrors"
	"github.com/alexkalak/qrmenu/src/errors/couriererrors"
	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/helpers/wshelpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/courierrepo"
	"github.com/alexkalak/qrmenu/src/repo/orderrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/gofiber/contrib/websocket"
	"golang.org/x/crypto/bcrypt"
)

type CourierService interface {
	Login(email string, password string) (models.Courier, error)
	GetCourierByEmail(email string) (models.Courier, error)
	GetCourierByID(courierID int) (models.Courier, error)
	CreateCourier(email string, password string) (models.Courier, error)
	UpdateCourier(courierID int, courier models.Courier) (models.Courier, error)
	DeleteCourier(courierID int) error
	GetAllAvailableOrdersForDelivery() ([]models.Order, error)
	GetAllCourierOrders(courierID int) ([]models.Order, error)

	UploadCourierImage(courierID int, fileHeader *multipart.FileHeader) (string, error)
	DeleteCourierImage(courierID int) error
	GetCourierImageFileName(id int) (string, error)

	ReserveOrder(courierID int, orderID int) error
	SetOrderStatusToCompleted(courierID int, orderID int) error
	SetOrderStatusToCanceled(courierID int, orderID int) error
	AddConnectionToCourierConnections(courierID int, conn *websocket.Conn) error
	RemoveConnectionFromCourierConnections(courierID int, conn *websocket.Conn) error
}

type courierService struct {
	PubsRepo                    pubsrepo.PubsRepo
	OrderService                orderservice.OrderService
	CourierRepo                 courierrepo.CourierRepo
	OrderRepo                   orderrepo.OrderRepo
	WebSocketCourierConnections wshelpers.ConnectionsForID
}

var singleton *courierService

func New() CourierService {
	if singleton != nil {
		return singleton
	}

	singleton = &courierService{
		PubsRepo:     pubsrepo.New(),
		CourierRepo:  courierrepo.New(),
		OrderService: orderservice.New(),
		OrderRepo:    orderrepo.New(),
		WebSocketCourierConnections: wshelpers.ConnectionsForID{
			Connections: map[int]wshelpers.ConnectionsSet{},
		},
	}
	singleton.OrderService.SubscribeOnOrderUpdates(singleton.UpdateOrderCallback)

	return singleton
}

func (s *courierService) GetAllAvailableOrdersForDelivery() ([]models.Order, error) {
	allOrders, err := s.OrderRepo.GetAllOrdersWithPreparingStatus()
	if err != nil {
		return nil, err
	}

	availableOrders := []models.Order{}
	for _, order := range allOrders {
		if order.OrderCourierInfo.IsReserved {
			continue
		}
		availableOrders = append(availableOrders, order)
	}

	return availableOrders, nil
}

func (s *courierService) GetAllCourierOrders(courierID int) ([]models.Order, error) {
	return s.CourierRepo.GetAllCourierOrders(courierID)
}

func (s *courierService) GetAllCourierDeliveredOrders(courierID int) ([]models.Order, error) {
	allOrders, err := s.OrderRepo.GetAllOrdersWithPreparingStatus()
	if err != nil {
		return nil, err
	}

	availableOrders := []models.Order{}
	for _, order := range allOrders {
		if order.OrderCourierInfo.IsReserved {
			continue
		}
		availableOrders = append(availableOrders, order)
	}

	return availableOrders, nil
}

func (s *courierService) UpdateOrderCallback(order models.Order) {
	fmt.Println("update callback")

	s.SendActiveOrderUpdateForAllCouriers(order)
}

func (s *courierService) Login(email string, password string) (models.Courier, error) {
	courier, err := s.GetCourierByEmail(email)
	if err != nil {
		return models.Courier{}, autherrors.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(courier.HashedPassword), []byte(password)); err != nil {
		return models.Courier{}, autherrors.ErrInvalidCredentials
	}

	return courier, nil
}

func (s *courierService) GetCourierByEmail(email string) (models.Courier, error) {
	return s.CourierRepo.GetCourierByEmail(email)
}

func (s *courierService) GetCourierByID(courierID int) (models.Courier, error) {
	return s.CourierRepo.GetCourierByID(courierID)
}

func (s *courierService) CreateCourier(email string, password string) (models.Courier, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return models.Courier{}, errors.New("hashing error")
	}

	return s.CourierRepo.CreateCourier(email, string(hashedPassword))
}

func (s *courierService) UpdateCourier(courierID int, courier models.Courier) (models.Courier, error) {
	courierFromDB, err := s.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		return models.Courier{}, err
	}

	courier.ID = courierFromDB.ID
	courier.Email = courierFromDB.Email
	courier.HashedPassword = courierFromDB.HashedPassword
	courier.ImageFileName = courierFromDB.ImageFileName

	return s.CourierRepo.UpdateCourier(courierID, courier)
}

func (s *courierService) DeleteCourier(id int) error {
	return s.CourierRepo.DeleteCourier(id)
}

func (s *courierService) UploadCourierImage(id int, fileHeader *multipart.FileHeader) (string, error) {
	err := s.CourierRepo.DeleteCourierImage(id)
	if err != nil {
		return "", err
	}

	return s.CourierRepo.UploadCourierImage(id, fileHeader)
}

func (s *courierService) DeleteCourierImage(id int) error {
	return s.CourierRepo.DeleteCourierImage(id)
}

func (s *courierService) GetCourierImageFileName(id int) (string, error) {
	return s.CourierRepo.GetCourierImageFileName(id)
}

func (s *courierService) AddConnectionToCourierConnections(courierID int, conn *websocket.Conn) error {
	_, err := s.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		return err
	}

	s.WebSocketCourierConnections.Mu.Lock()
	existingConnections, ok := s.WebSocketCourierConnections.Connections[courierID]
	if !ok {
		existingConnections = wshelpers.ConnectionsSet{}
		s.WebSocketCourierConnections.Connections[courierID] = existingConnections
	}

	existingConnections.Add(conn)
	fmt.Println("added new courier connection, allConnections: ", s.WebSocketCourierConnections.Connections[courierID])

	s.WebSocketCourierConnections.Mu.Unlock()
	return nil
}

func (s *courierService) ReserveOrder(courierID int, orderID int) error {
	_, err := s.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		return err
	}

	order, err := s.OrderService.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	if order.OrderCourierInfo.IsReserved {
		return ordererrors.ErrOrderIsAlreadyReserved
	}

	pub, err := s.PubsRepo.GetPubById(order.PubID)
	if err != nil {
		return err
	}

	if pub.Shipping.DeliveryType == models.DELIVERY_TYPE_OWN {
		isPubsCourier := false
		for _, courier := range pub.Couriers {
			if courier.ID == uint(courierID) {
				isPubsCourier = true
				break
			}
		}
		if !isPubsCourier {
			return couriererrors.ErrCourierCannotReserveThisOrder
		}
	}

	newCourierInfo := order.OrderCourierInfo
	newCourierInfo.IsReserved = true
	newCourierInfo.ReserverCourierID = courierID

	_, err = s.OrderService.UpdateOrderCourierInfo(orderID, newCourierInfo)
	if err != nil {
		return err
	}

	return nil
}

func (s *courierService) SetOrderStatusToCompleted(courierID int, orderID int) error {
	_, err := s.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		return err
	}

	order, err := s.OrderService.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	if order.OrderCourierInfo.ReserverCourierID != courierID {
		return couriererrors.ErrNotCouriersOrder
	}

	err = s.OrderService.UpdateOrderStatus(orderID, models.COMPLETED_ORDER_STATUS)
	if err != nil {
		return err
	}

	return nil
}

func (s *courierService) SetOrderStatusToCanceled(courierID int, orderID int) error {
	_, err := s.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		return err
	}

	order, err := s.OrderService.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	if order.OrderCourierInfo.ReserverCourierID != courierID {
		return couriererrors.ErrNotCouriersOrder
	}

	err = s.OrderService.UpdateOrderStatus(orderID, models.CANCELED_ORDER_STATUS)
	if err != nil {
		return err
	}

	return nil
}

func (s *courierService) RemoveConnectionFromCourierConnections(courierID int, conn *websocket.Conn) error {
	s.WebSocketCourierConnections.Mu.Lock()
	s.WebSocketCourierConnections.Connections[courierID].Remove(conn)
	s.WebSocketCourierConnections.Mu.Unlock()
	return nil
}

func (s *courierService) SendActiveOrderUpdateForAllCouriers(order models.Order) error {

	conns := wshelpers.ConnectionsSet{}
	for _, value := range s.WebSocketCourierConnections.Connections {
		for conn := range value {
			conns[conn] = nil
		}
	}

	return s.SendSingleCourierOrderMessage(order, UPDATE_EVENT_TYPE, conns)
}

func (s *courierService) SendSingleCourierOrderMessage(order models.Order, eventType EventType, connections wshelpers.ConnectionsSet) error {
	fmt.Println("courier connections: ", connections)
	fmt.Println("sending notifications for ", len(connections), " courier connections")

	outputOrder := entities.OrderOutput{}
	err := outputOrder.FillFromModel(order)
	if err != nil {
		return err
	}

	for conn := range connections {

		message := WSCourierOrderMessage{
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
