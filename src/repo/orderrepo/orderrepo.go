package orderrepo

import (
	"errors"

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
	GetOrdersForPub(pubID int) ([]models.Order, error)
	GetOrdersForClient(clientID int) ([]models.Order, error)
	GetOrderByID(orderID int) (models.Order, error)
	GetOrderByIDWithinTransaction(tx *gorm.DB, orderID int) (models.Order, error)
	CreateOrder(models.Order) (models.Order, error)
	CreateOrderWithinTransaction(tx *gorm.DB, order models.Order) (models.Order, error)
	UpdateOrderStatus(orderID int, status string) error
	UpdateOrderStatusWithinTransaction(tx *gorm.DB, orderID int, status string) error
	UpdateOrderDishes(orderID int, dishesJSON string) error
	UpdateOrderDishesWithinTransaction(tx *gorm.DB, orderID int, dishesJSON string) error
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

func (r *orderRepo) GetOrdersForPub(pubID int) ([]models.Order, error) {
	var orders []models.Order

	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").Find(&orders, "pub_id = ?", pubID)

	if resp.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return orders, nil
}

func (r *orderRepo) GetOrdersForClient(clientID int) ([]models.Order, error) {
	var orders []models.Order
	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").Find(&orders, "client_id = ?", clientID)

	if resp.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return orders, nil
}

func (r *orderRepo) GetOrderByID(orderID int) (models.Order, error) {
	order := models.Order{}
	resp := r.Database.Model(&models.Order{}).Preload("Client").Preload("Pub").First(&order, "id = ?", orderID)

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
	resp := tx.Model(&models.Order{}).Preload("Client").Preload("Pub").First(&order, "id = ?", orderID)

	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.Order{}, ordererrors.ErrOrderNotFound
		}
		return models.Order{}, servererrors.ErrInternalServerError
	}

	return order, nil
}

func (r *orderRepo) CreateOrder(order models.Order) (models.Order, error) {
	var err error
	result := r.Database.Preload("Client").Preload("Pub").Create(&order)

	if result.Error != nil {
		return models.Order{}, ordererrors.ErrUnableToCreateOrder
	}

	order, err = r.GetOrderByID(int(order.ID))
	if err != nil {
		return models.Order{}, err
	}

	return order, nil
}
func (r *orderRepo) CreateOrderWithinTransaction(tx *gorm.DB, order models.Order) (models.Order, error) {
	var err error
	result := tx.Preload("Pub").Create(&order)

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

func (r *orderRepo) UpdateOrderDishes(orderID int, dishesJSON string) error {
	err := r.Database.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("dishes_json", dishesJSON).Error
	return err
}

func (r *orderRepo) UpdateOrderDishesWithinTransaction(tx *gorm.DB, orderID int, dishesJSON string) error {
	err := tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("dishes_json", dishesJSON).Error
	return err
}

func (r *orderRepo) RateOrderWithinTransaction(tx *gorm.DB, orderID int, rating int) error {
	err := tx.Model(&models.Order{}).Where("id = ?", orderID).UpdateColumn("rating", rating).Error
	return err
}
