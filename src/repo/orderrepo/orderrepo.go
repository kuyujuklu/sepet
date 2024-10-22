package orderrepo

import (
	"errors"
	"fmt"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type OrderRepo interface {
	NewTransaction() *gorm.DB
	GetAllOrders() ([]models.Order, error)
	GetAllOrdersWithPreparingStatus() ([]models.Order, error)
	GetOrdersForPub(pubID int) ([]models.Order, error)
	GetOrdersForClient(clientID int) ([]models.Order, error)
	GetOrderByID(orderID int) (models.Order, error)
	GetOrderByIDWithinTransaction(tx *gorm.DB, orderID int) (models.Order, error)
	CreateOrder(models.Order, models.OrderCourierInfo) (models.Order, error)
	CreateOrderWithinTransaction(tx *gorm.DB, order models.Order, courierInfo models.OrderCourierInfo) (models.Order, error)
	UpdateOrderStatus(orderID int, status string) error
	UpdateOrderStatusWithinTransaction(tx *gorm.DB, orderID int, status string) error
	UpdateOrderDeliveryPrice(orderID int, price float64) error
	UpdateOrderDeliveryPriceWithinTransaction(tx *gorm.DB, orderID int, price float64) error
	UpdateOrderDishes(orderID int, dishesJSON string) error
	UpdateOrderDishesWithinTransaction(tx *gorm.DB, orderID int, dishesJSON string) error
	UpdateOrderCourierInfo(orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error)
	UpdateOrderCourierInfoWithingTransaction(tx *gorm.DB, orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error)
	RateOrderWithinTransaction(tx *gorm.DB, orderID int, rating int) error
}

type orderRepo struct {
	Database *gorm.DB
}

func New() OrderRepo {
	return &orderRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *orderRepo) NewTransaction() *gorm.DB {
	return r.Database.Begin()
}

func (r *orderRepo) GetAllOrders() ([]models.Order, error) {
	orders := []models.Order{}
	resp := r.Database.Preload("Client").Preload("Pub").Preload("OrderCourierInfo").Find(&orders)
	if resp.Error != nil {
		return nil, ordererrors.ErrUnableToGetOrder
	}

	return orders, nil
}

func (r *orderRepo) GetAllOrdersWithPreparingStatus() ([]models.Order, error) {
	orders := []models.Order{}
	resp := r.Database.Preload("Client").Preload("Pub").Preload("OrderCourierInfo").Find(&orders, "status = ?", models.PREPARING_ORDER_STATUS)
	if resp.Error != nil {
		return nil, ordererrors.ErrUnableToGetOrder
	}

	return orders, nil
}

func (r *orderRepo) GetOrdersForPub(pubID int) ([]models.Order, error) {
	var orders []models.Order

	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").Preload("OrderCourierInfo").Find(&orders, "pub_id = ?", pubID)

	if resp.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return orders, nil
}

func (r *orderRepo) GetOrdersForClient(clientID int) ([]models.Order, error) {
	var orders []models.Order
	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").Preload("OrderCourierInfo").Find(&orders, "client_id = ?", clientID)

	if resp.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return orders, nil
}

func (r *orderRepo) GetOrderByID(orderID int) (models.Order, error) {
	order := models.Order{}
	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").Preload("OrderCourierInfo").First(&order, "id = ?", orderID)

	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.Order{}, ordererrors.ErrOrderNotFound
		}
		return models.Order{}, servererrors.ErrInternalServerError
	}

	return order, nil
}

func (r *orderRepo) GetOrderByIDWithinTransaction(tx *gorm.DB, orderID int) (models.Order, error) {
	order := models.Order{}
	resp := tx.Model(&models.Order{}).Preload("Client").Preload("Pub").Preload("OrderCourierInfo").First(&order, "id = ?", orderID)

	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.Order{}, ordererrors.ErrOrderNotFound
		}
		return models.Order{}, servererrors.ErrInternalServerError
	}

	return order, nil
}

func (r *orderRepo) CreateOrder(order models.Order, courierInfo models.OrderCourierInfo) (models.Order, error) {
	var err error

	result := r.Database.Create(&courierInfo)
	if result.Error != nil {
		fmt.Println("Creating default courier info err ", result.Error)
		return models.Order{}, ordererrors.ErrUnableToCreateOrder
	}

	order.OrderCourierInfo = courierInfo

	result = r.Database.Preload("Client").Preload("Pub").Preload("OrderCourierInfo").Create(&order)
	if result.Error != nil {
		return models.Order{}, ordererrors.ErrUnableToCreateOrder
	}

	order, err = r.GetOrderByID(int(order.ID))
	if err != nil {
		return models.Order{}, err
	}

	return order, nil
}
func (r *orderRepo) CreateOrderWithinTransaction(tx *gorm.DB, order models.Order, courierInfo models.OrderCourierInfo) (models.Order, error) {
	var err error
	result := r.Database.Create(&courierInfo)
	if result.Error != nil {
		fmt.Println("Creating default courier info err ", result.Error)
		return models.Order{}, ordererrors.ErrUnableToCreateOrder
	}

	order.OrderCourierInfo = courierInfo

	result = tx.Preload("Pub").Create(&order)

	if result.Error != nil {
		return models.Order{}, ordererrors.ErrUnableToCreateOrder
	}

	order, err = r.GetOrderByIDWithinTransaction(tx, int(order.ID))
	if err != nil {
		return models.Order{}, err
	}

	return order, nil
}

func (r *orderRepo) UpdateOrderStatus(orderID int, status string) error {
	err := r.Database.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("status", status).Error
	return err
}

func (r *orderRepo) UpdateOrderStatusWithinTransaction(tx *gorm.DB, orderID int, status string) error {
	err := tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("status", status).Error
	return err
}

func (r *orderRepo) UpdateOrderDeliveryPrice(orderID int, price float64) error {
	order, err := r.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	err = r.Database.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("delivery_price", price).Error
	if err != nil {
		return err
	}

	err = r.Database.Model(&models.OrderCourierInfo{}).Where("id = ?", order.OrderCourierInfoID).UpdateColumn("courier_reward", price).Error
	if err != nil {
		return err
	}

	return err
}

func (r *orderRepo) UpdateOrderDeliveryPriceWithinTransaction(tx *gorm.DB, orderID int, price float64) error {
	order, err := r.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return err
	}

	err = tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("delivery_price", price).Error
	if err != nil {
		return err
	}

	err = tx.Model(&models.OrderCourierInfo{}).Where("id = ?", order.OrderCourierInfoID).UpdateColumn("courier_reward", price).Error
	if err != nil {
		return err
	}

	return err
}

func (r *orderRepo) UpdateOrderDishes(orderID int, dishesJSON string) error {
	err := r.Database.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("dishes_json", dishesJSON).Error
	return err
}

func (r *orderRepo) UpdateOrderDishesWithinTransaction(tx *gorm.DB, orderID int, dishesJSON string) error {
	err := tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("dishes_json", dishesJSON).Error
	return err
}

func (r *orderRepo) UpdateOrderCourierInfo(orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error) {
	order, err := r.GetOrderByID(orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	courierInfo.ID = order.OrderCourierInfo.ID
	courierInfo.CreatedAt = order.OrderCourierInfo.CreatedAt
	courierInfo.UpdatedAt = order.OrderCourierInfo.UpdatedAt
	courierInfo.DeletedAt = order.OrderCourierInfo.DeletedAt

	err = r.Database.Save(&courierInfo).Error
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	return courierInfo, err
}

func (r *orderRepo) UpdateOrderCourierInfoWithingTransaction(tx *gorm.DB, orderID int, courierInfo models.OrderCourierInfo) (models.OrderCourierInfo, error) {
	order, err := r.GetOrderByIDWithinTransaction(tx, orderID)
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	courierInfo.ID = order.OrderCourierInfo.ID
	courierInfo.CreatedAt = order.OrderCourierInfo.CreatedAt
	courierInfo.UpdatedAt = order.OrderCourierInfo.UpdatedAt
	courierInfo.DeletedAt = order.OrderCourierInfo.DeletedAt

	err = tx.Save(&courierInfo).Error
	if err != nil {
		return models.OrderCourierInfo{}, err
	}

	return courierInfo, err
}

func (r *orderRepo) RateOrderWithinTransaction(tx *gorm.DB, orderID int, rating int) error {
	err := tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("rating", rating).Error
	return err
}
