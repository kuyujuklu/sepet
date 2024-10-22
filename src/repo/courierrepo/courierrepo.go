package courierrepo

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"strings"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/couriererrors"
	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Configure() error {
	if err := os.MkdirAll(COURIER_IMAGES_PATH, os.ModePerm); err != nil {
		return err
	}

	return nil
}

const (
	COURIER_IMAGES_PATH = "clientfiles/images/courier/"
)

type CourierRepo interface {
	GetAllCouriers() ([]models.Courier, error)
	GetAllCouriersWithTelegramUsername(telegramUsername string) ([]models.Courier, error)
	GetCourierByEmail(email string) (models.Courier, error)
	GetCourierByID(courierID int) (models.Courier, error)
	CreateCourier(email string, hashedPassword string) (models.Courier, error)
	UpdateCourier(courierID int, courier models.Courier) (models.Courier, error)
	DeleteCourier(courierID int) error
	GetAllCourierOrders(courierID int) ([]models.Order, error)

	UploadCourierImage(courierID int, fileHeader *multipart.FileHeader) (string, error)
	DeleteCourierImage(courierID int) error
	GetCourierImageFileName(id int) (string, error)
}

type courierRepo struct {
	Database *gorm.DB
}

func New() CourierRepo {
	return &courierRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *courierRepo) GetAllCouriers() ([]models.Courier, error) {
	var couriers []models.Courier
	result := r.Database.Find(&couriers)

	if result.Error != nil {
		return nil, couriererrors.ErrUnableToGetCourier
	}

	return couriers, nil
}

func (r *courierRepo) GetAllCouriersWithTelegramUsername(telegramUsername string) ([]models.Courier, error) {
	var couriers []models.Courier
	result := r.Database.Find(&couriers, "telegram_username = ?", telegramUsername)

	if result.Error != nil {
		return nil, couriererrors.ErrUnableToGetCourier
	}

	return couriers, nil
}

func (r *courierRepo) GetAllCourierOrders(courierID int) ([]models.Order, error) {
	_, err := r.GetCourierByID(courierID)
	if err != nil {
		return nil, err
	}

	orders := []models.Order{}

	resp := r.Database.
		Joins("JOIN order_courier_infos on orders.order_courier_info_id = order_courier_infos.id").
		Preload("Client").
		Preload("Pub").
		Preload("OrderCourierInfo").
		Find(&orders, "order_courier_infos.reserver_courier_id = ?", courierID)

	if resp.Error != nil {
		return nil, ordererrors.ErrUnableToGetOrder
	}

	fmt.Println("courier all orders: ", helpers.ConvertToJSON(orders))

	return orders, nil
}

func (r *courierRepo) GetCourierByEmail(email string) (models.Courier, error) {
	courier := models.Courier{}

	resp := r.Database.First(&courier, "email = ?", email)
	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.Courier{}, couriererrors.ErrCourierNotFound
		}
		return models.Courier{}, couriererrors.ErrUnableToGetCourier
	}

	return courier, nil
}

func (r *courierRepo) GetCourierByID(courierID int) (models.Courier, error) {
	courier := models.Courier{}

	resp := r.Database.First(&courier, "id = ?", courierID)
	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.Courier{}, couriererrors.ErrCourierNotFound
		}
		return models.Courier{}, couriererrors.ErrUnableToGetCourier
	}

	return courier, nil
}

func (r *courierRepo) CreateCourier(email string, hashedPassword string) (models.Courier, error) {
	courier := models.Courier{
		Email:          email,
		HashedPassword: hashedPassword,
	}

	resp := r.Database.Create(&courier)
	if resp.Error != nil {
		return models.Courier{}, couriererrors.ErrUnableToCreateCourier
	}

	return courier, nil
}

func (r *courierRepo) UpdateCourier(courierID int, courier models.Courier) (models.Courier, error) {
	courierFromDB, err := r.GetCourierByID(courierID)
	if err != nil {
		return models.Courier{}, err
	}

	courier.ID = courierFromDB.ID

	resp := r.Database.Save(&courier)
	if resp.Error != nil {
		return models.Courier{}, couriererrors.ErrUnableToUpdateCourier
	}

	return courier, nil
}

func (r *courierRepo) DeleteCourier(courierID int) error {
	resp := r.Database.Delete(&models.Courier{}, courierID)
	if resp.Error != nil {
		return couriererrors.ErrUnableToDeleteCourier
	}

	return nil
}

func (r *courierRepo) UploadCourierImage(courierID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := r.GetCourierByID(courierID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileNameSplitted := strings.Split(fileHeader.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	fileName := fileID + "." + fileExtension

	file, err := os.OpenFile(COURIER_IMAGES_PATH+fileName, os.O_CREATE|os.O_WRONLY, 0777)
	if err != nil {
		return "", oserrors.ErrUnableToOpenFile
	}
	defer file.Close()

	src, err := fileHeader.Open()
	if err != nil {
		return "", oserrors.ErrUnableToOpenFile
	}
	defer src.Close()

	_, err = io.Copy(file, src)
	if err != nil {
		return "", oserrors.ErrUnableToSaveFile
	}

	err = r.Database.Model(&models.Courier{}).Where("id = ?", courierID).UpdateColumn("image_file_name", fileName).Error
	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (r *courierRepo) DeleteCourierImage(courierID int) error {
	courier, err := r.GetCourierByID(courierID)
	if err != nil {
		return err
	}

	if courier.ImageFileName == "" {
		return nil
	}

	err = os.Remove(COURIER_IMAGES_PATH + courier.ImageFileName)

	if err != nil {
		exists := !errors.Is(err, os.ErrNotExist)
		if exists {
			logs.Error("unable to delete courier image ", err)
			return oserrors.ErrUnableToDeleteFile
		}
	}

	err = r.Database.Model(&models.Courier{}).Where("id = ?", courierID).UpdateColumn("image_file_name", "").Error
	if err != nil {
		return err
	}

	return nil
}

func (r *courierRepo) GetCourierImageFileName(id int) (string, error) {
	var courier models.Courier
	result := r.Database.First(&courier, "id = ?", id)

	if result.Error != nil {
		return "", couriererrors.ErrCourierHaveNoImage
	}

	return courier.ImageFileName, nil
}
