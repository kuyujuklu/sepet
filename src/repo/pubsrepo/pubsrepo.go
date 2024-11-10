package pubsrepo

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"strings"
	"time"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/errors/disheserrors"
	"github.com/alexkalak/qrmenu/src/errors/menuerrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/courierrepo"
	"github.com/alexkalak/qrmenu/src/repo/menurepo"
	"github.com/google/uuid"
	qrcode "github.com/skip2/go-qrcode"
	"gorm.io/gorm"
)

func Configure() error {
	if err := os.MkdirAll(PUB_LOGO_FILE_PATH, os.ModePerm); err != nil {
		return err
	}

	if err := os.MkdirAll(PUB_BACKGROUND_FILE_PATH, os.ModePerm); err != nil {
		return err
	}

	if err := os.MkdirAll(QR_CODES_FILE_PATH, os.ModePerm); err != nil {
		return err
	}
	return nil
}

const (
	PUB_LOGO_FILE_PATH       = "clientfiles/images/pubs/logos/"
	PUB_BACKGROUND_FILE_PATH = "clientfiles/images/pubs/bgs/"
	QR_CODES_FILE_PATH       = "clientfiles/images/pubs/qr/"
)

type PubsRepo interface {
	GetAllPubs() ([]models.Pub, error)
	GetAllMenusForPub(pubID int) ([]models.Menu, error)
	GetAllCategoriesForPub(pubID int) ([]models.Category, error)
	GetCategoriesWithPreloadedMenuForPubs(pubs []models.Pub) ([]models.Category, error)
	GetAllDishesForPub(pubID int) ([]models.Dish, error)
	GetPubById(id int) (models.Pub, error)
	GetPubByUrlName(urlName string) (models.Pub, error)

	CreatePub(pub models.Pub) (models.Pub, error)
	UpdatePub(id int, pub models.Pub) (models.Pub, error)
	UpdateExpirationTime(id int, t time.Time) (time.Time, error)
	DeletePub(id int) error
	GetCompanyID(pubID int) (int, error)

	UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error)
	UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error)
	DeletePubLogo(shipmentID int) error
	DeletePubBG(shipmentID int) error
	GetPubLogoFileName(pubID int) (string, error)
	GetPubBGFileName(pubID int) (string, error)

	//Geolocation
	SetLatLng(pubID int, lat float64, lng float64) error

	//Shipping
	GetPubsWithAvailableShipping() ([]models.Pub, error)
	EnableShipping(pubID int) error
	GetPubShapes(pubID int) ([]models.Shape, error)
	SetPubShapes(pubID int, shapes []models.Shape) error
	GetShipping(pubID int) (models.Shipping, error)
	SetShippingAvailable(pubID int, available bool) error
	SetShippingTime(pubID int, shippingTimeFrom int, shippingTimeTo int) error
	SetShippingWorkingTime(pubID int, start int, end int) error
	SetShippingPrices(pubID int, shippingPrices map[string]float64) error
	SetShippingFreeDeliveryPrices(pubID int, shippingFreeDeliveryPrices map[string]float64) error
	SetCardPreorder(pubID int, available bool) error
	SetCashPreorder(pubID int, available bool) error
	GetPreorderInfo(pubID int) (models.PreorderInfo, error)
	UpdatePubDeliveryType(pubID int, deliveryType string) error
	SetPubAddCommissionToDishPrices(pubID int, addCommission bool) error

	//Telegram stuff
	GetPubsWhichHasTelegramUsername(username string) ([]models.Pub, error)

	//Couriers
	AddCourierToPub(pubID, courierID int) error
	RemoveCourierFromPub(pubID int, courierID int) error
}

type pubsRepo struct {
	Database    *gorm.DB
	MenuRepo    menurepo.MenuRepo
	CourierRepo courierrepo.CourierRepo
	HttpScheme  string
	HttpHost    string
	Port        string
}

func New() PubsRepo {
	return &pubsRepo{
		HttpHost:    os.Getenv("HTTP_HOST"),
		HttpScheme:  os.Getenv("HTTP_SCHEME"),
		Port:        os.Getenv("PORT"),
		Database:    postgresql.GetDB(),
		CourierRepo: courierrepo.New(),
		MenuRepo:    menurepo.New(),
	}
}

func (r *pubsRepo) GetAllPubs() ([]models.Pub, error) {
	var pubs []models.Pub
	result := r.Database.Preload("Shipping").Preload("Company").Preload("PreorderInfo").Preload("Couriers").Find(&pubs)

	if result.Error != nil {
		return nil, puberrors.ErrUnableToGetPub
	}

	return pubs, nil
}

func (r *pubsRepo) GetPubById(id int) (models.Pub, error) {
	var pub models.Pub
	result := r.Database.Preload("Shipping").Preload("Company").Preload("PreorderInfo").Preload("Couriers").First(&pub, "id = ?", id)

	if result.Error != nil {
		fmt.Println("error: ", result.Error)
		return models.Pub{}, puberrors.ErrPubNotFound
	}

	return pub, nil
}

func (r *pubsRepo) GetPubByUrlName(urlName string) (models.Pub, error) {
	var pub models.Pub
	result := r.Database.Preload("Shipping").Preload("PreorderInfo").Preload("Couriers").First(&pub, "url_name = ?", urlName)

	if result.Error != nil {
		fmt.Println("error: ", result.Error)
		return models.Pub{}, puberrors.ErrPubNotFound
	}

	return pub, nil
}

func (r *pubsRepo) GetAllMenusForPub(pubID int) ([]models.Menu, error) {
	var menus []models.Menu
	result := r.Database.Where("pub_id = ?", pubID).Find(&menus)

	if result.Error != nil {
		return nil, menuerrors.ErrUnableToGetMenu
	}

	return menus, nil
}

func (r *pubsRepo) GetAllCategoriesForPub(pubID int) ([]models.Category, error) {
	menus, err := r.GetAllMenusForPub(pubID)
	if err != nil {
		return nil, err
	}
	if len(menus) == 0 {
		return nil, nil
	}

	condition := "menu_id in ("
	for i, menu := range menus {
		condition += fmt.Sprint(menu.ID)
		if i != len(menus)-1 {
			condition += ", "
		}
	}
	condition += ")"

	categories := make([]models.Category, 0)
	result := r.Database.Where(condition).Find(&categories)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return categories, nil
		}
		return nil, categoryerrors.ErrUnableToGetCategory
	}

	return categories, nil
}

func (r *pubsRepo) GetCategoriesWithPreloadedMenuForPubs(pubs []models.Pub) ([]models.Category, error) {
	if len(pubs) == 0 {
		return nil, nil
	}

	menus := make([]models.Menu, 0)
	menusCondition := "pub_id in ("
	for i, pub := range pubs {
		menusCondition += fmt.Sprint(pub.ID)
		if i != len(pubs)-1 {
			menusCondition += ", "
		}
	}
	menusCondition += ")"
	resp := r.Database.Where(menusCondition).Find(&menus)
	if resp.Error != nil {
		return nil, menuerrors.ErrUnableToGetMenu
	}

	if len(menus) == 0 {
		return nil, nil
	}

	categories := make([]models.Category, 0)
	categoriesCondition := "menu_id in ("
	for i, menu := range menus {
		categoriesCondition += fmt.Sprint(menu.ID)
		if i != len(menus)-1 {
			categoriesCondition += ", "
		}
	}
	categoriesCondition += ")"

	resp = r.Database.Preload("Menu").Where(categoriesCondition).Find(&categories)
	if resp.Error != nil {
		return nil, categoryerrors.ErrUnableToGetCategory
	}

	return categories, nil
}

func (r *pubsRepo) GetAllDishesForPub(pubID int) ([]models.Dish, error) {
	categories, err := r.GetAllCategoriesForPub(pubID)
	if err != nil {
		return nil, err
	}
	if len(categories) == 0 {
		return nil, nil
	}

	condition := "category_id in ("
	for i, category := range categories {
		condition += fmt.Sprint(category.ID)
		if i != len(categories)-1 {
			condition += ", "
		}
	}
	condition += ")"

	dishes := make([]models.Dish, 0)
	result := r.Database.Where(condition).Find(&dishes)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return dishes, nil
		}
		return nil, disheserrors.ErrUnableToGetDish
	}

	return dishes, nil
}

func (r *pubsRepo) CreatePub(pub models.Pub) (models.Pub, error) {
	shipping := models.Shipping{
		DeliveryType:          models.DELIVERY_TYPE_OWN,
		ShippingTimeFrom:      40,
		ShippingTimeTo:        60,
		ShippingStartWorkTime: 0,    //00:00
		ShippingEndWorkTime:   1440, //24:00
	}

	err := r.Database.Create(&shipping).Error
	if err != nil {
		return models.Pub{}, puberrors.ErrUnableToCreatePub
	}

	pub.ShippingID = shipping.ID
	pub.Shipping = shipping

	var preorderInfo models.PreorderInfo
	err = r.Database.Create(&preorderInfo).Error
	if err != nil {
		return models.Pub{}, puberrors.ErrUnableToCreatePub
	}

	pub.PreorderInfoID = preorderInfo.ID
	pub.PreorderInfo = preorderInfo

	result := r.Database.Create(&pub)
	if result.Error != nil {
		return models.Pub{}, puberrors.ErrUnableToCreatePub
	}

	fileID := uuid.New().String()

	err = qrcode.WriteFile(r.getPubLink(pub.UrlName), qrcode.Medium, 256, QR_CODES_FILE_PATH+fileID+".png")
	if err != nil {
		logs.Error("unable to create qr code for pub ", err, " pub id ", pub.ID)
		return models.Pub{}, err
	}

	pub.QrCodeFileName = fileID + ".png"

	result = r.Database.
		Model(&models.Pub{}).
		Where("id = ?", pub.ID).
		UpdateColumn("qr_code_file_name", pub.QrCodeFileName)

	if result.Error != nil {
		logs.Error("unable to update pub qr code file name ", err, " pub id ", pub.ID)
		return models.Pub{}, err
	}

	return pub, nil
}

func (r *pubsRepo) getPubLink(urlName string) string {
	return fmt.Sprintf("%s://%s/pub/%s", r.HttpScheme, r.HttpHost, urlName)
}

func (r *pubsRepo) UpdatePub(id int, pub models.Pub) (models.Pub, error) {
	result := r.Database.Save(&pub)

	if result.Error != nil {
		return models.Pub{}, puberrors.ErrUnableToUpdatePub
	}

	return pub, nil
}

func (r *pubsRepo) UpdateExpirationTime(id int, t time.Time) (time.Time, error) {
	err := r.Database.Model(&models.Pub{}).Where("id = ?", id).UpdateColumn("expiration_time", t).Error
	if err != nil {
		return time.Unix(0, 0), err
	}

	pub, err := r.GetPubById(id)
	if err != nil {
		return time.Unix(0, 0), err
	}

	return pub.ExpirationTime, nil
}

func (r *pubsRepo) DeletePub(id int) error {
	result := r.Database.Delete(&models.Pub{}, id)

	if result.Error != nil {
		return puberrors.ErrUnableToDeletePub
	}

	return nil
}

func (r *pubsRepo) GetCompanyID(pubID int) (int, error) {
	pub, err := r.GetPubById(pubID)
	if err != nil {
		return 0, err
	}

	return int(pub.CompanyID), nil
}

func (s *pubsRepo) UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileNameSplitted := strings.Split(fileHeader.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	fileName := fileID + "." + fileExtension

	file, err := os.OpenFile(PUB_LOGO_FILE_PATH+fileName, os.O_CREATE|os.O_WRONLY, 0777)
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

	err = s.Database.Model(&models.Pub{}).Where("id = ?", pubID).UpdateColumn("logo_file_name", fileName).Error
	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (s *pubsRepo) UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileNameSplitted := strings.Split(fileHeader.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	fileName := fileID + "." + fileExtension

	file, err := os.OpenFile(PUB_BACKGROUND_FILE_PATH+fileName, os.O_CREATE|os.O_WRONLY, 0777)
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

	err = s.Database.Model(&models.Pub{}).Where("id = ?", pubID).UpdateColumn("bg_image_file_name", fileName).Error
	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (s *pubsRepo) DeletePubLogo(pubID int) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	if pub.LogoFileName == "" {
		return nil
	}

	err = os.Remove(PUB_LOGO_FILE_PATH + pub.LogoFileName)
	if err != nil {
		exists := !errors.Is(err, os.ErrNotExist)
		if exists {
			logs.Error("unable to delete pub logo ", err)
			return oserrors.ErrUnableToDeleteFile
		}
	}

	err = s.Database.Model(&models.Pub{}).Where("id = ?", pubID).UpdateColumn("logo_file_name", "").Error
	if err != nil {
		return err
	}

	return nil
}

func (s *pubsRepo) DeletePubBG(pubID int) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	if pub.BgImageFileName == "" {
		return nil
	}

	err = os.Remove(PUB_BACKGROUND_FILE_PATH + pub.BgImageFileName)

	if err != nil {
		exists := !errors.Is(err, os.ErrNotExist)
		if exists {
			logs.Error("unable to delete pub bg image ", err)
			return oserrors.ErrUnableToDeleteFile
		}
	}

	err = s.Database.Model(&models.Pub{}).Where("id = ?", pubID).UpdateColumn("bg_image_file_name", "").Error
	if err != nil {
		return err
	}

	return nil
}

func (s *pubsRepo) GetPubLogoFileName(pubID int) (string, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	if pub.LogoFileName == "" {
		return "", puberrors.ErrPubHasNoLogo
	}

	return pub.LogoFileName, nil
}

func (s *pubsRepo) GetPubBGFileName(pubID int) (string, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	if pub.BgImageFileName == "" {
		return "", puberrors.ErrPubHasNoBG
	}

	return pub.BgImageFileName, nil
}

func (s *pubsRepo) SetLatLng(pubID int, lat float64, lng float64) error {
	_, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	resp := s.Database.Model(&models.Pub{}).Where("id = ?", pubID).Updates(map[string]interface{}{"lat": lat, "lng": lng})
	if resp.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) EnableShipping(pubID int) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	pub.Shipping.Available = true
	err = s.Database.Model(&models.Shipping{}).Where("id = ?", pub.ShippingID).UpdateColumn("available", true).Error
	return err
}

func (s *pubsRepo) GetShipping(pubID int) (models.Shipping, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return models.Shipping{}, err
	}

	return pub.Shipping, nil
}

func (s *pubsRepo) GetPubShapes(pubID int) ([]models.Shape, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return nil, err
	}

	if pub.Shipping.ShapesJSON == "" {
		return nil, nil
	}

	shapes := make([]models.Shape, 0)
	err = json.Unmarshal([]byte(pub.Shipping.ShapesJSON), &shapes)
	if err != nil {
		return nil, servererrors.ErrInternalServerError
	}
	return shapes, nil
}

func (s *pubsRepo) SetPubShapes(pubID int, shapes []models.Shape) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}
	shapesJson, err := json.Marshal(shapes)
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	res := s.Database.Model(&models.Shipping{}).Where("id = ?", pub.ShippingID).UpdateColumn("shapes_json", shapesJson)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetShippingAvailable(pubID int, available bool) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	res := s.Database.Model(&models.Shipping{}).Where("id = ?", pub.ShippingID).UpdateColumn("available", available)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetShippingTime(pubID int, shippingTimeFrom int, shippingTimeTo int) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	res := s.Database.
		Model(&models.Shipping{}).
		Where("id = ?", pub.ShippingID).
		UpdateColumns(
			map[string]interface{}{
				"shipping_time_from": shippingTimeFrom,
				"shipping_time_to":   shippingTimeTo,
			},
		)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetShippingWorkingTime(pubID int, start int, end int) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	res := s.Database.
		Model(&models.Shipping{}).
		Where("id = ?", pub.ShippingID).
		UpdateColumns(
			map[string]interface{}{
				"shipping_start_work_time": start,
				"shipping_end_work_time":   end,
			},
		)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetShippingPrices(pubID int, shippingPrices map[string]float64) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	pricesJSON, err := json.Marshal(shippingPrices)
	if err != nil {
		return err
	}

	res := s.Database.
		Model(&models.Shipping{}).
		Where("id = ?", pub.ShippingID).
		UpdateColumns(
			map[string]interface{}{
				"shipping_prices_json": string(pricesJSON),
			},
		)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetShippingFreeDeliveryPrices(pubID int, shippingFreeDeliveryPrices map[string]float64) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.Shipping{}, "id = ?", pub.ShippingID).Error
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	pricesJSON, err := json.Marshal(shippingFreeDeliveryPrices)
	if err != nil {
		return err
	}

	res := s.Database.
		Model(&models.Shipping{}).
		Where("id = ?", pub.ShippingID).
		UpdateColumns(
			map[string]interface{}{
				"shipping_free_delivery_prices_json": string(pricesJSON),
			},
		)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetCardPreorder(pubID int, available bool) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.PreorderInfo{}, "id = ?", pub.PreorderInfoID).Error
	if err != nil {
		return puberrors.ErrPubPreorderIsInvalid
	}

	err = s.Database.Model(&models.PreorderInfo{}).Where("id = ?", pub.PreorderInfoID).UpdateColumn("card_preorder", available).Error
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (s *pubsRepo) SetCashPreorder(pubID int, available bool) error {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return err
	}

	err = s.Database.First(&models.PreorderInfo{}, "id = ?", pub.PreorderInfoID).Error
	if err != nil {
		return puberrors.ErrPubPreorderIsInvalid
	}

	res := s.Database.Model(&models.PreorderInfo{}).Where("id = ?", pub.PreorderInfoID).UpdateColumn("cash_preorder", available)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (r *pubsRepo) GetPreorderInfo(pubID int) (models.PreorderInfo, error) {
	pub, err := r.GetPubById(pubID)
	if err != nil {
		return models.PreorderInfo{}, err
	}

	return pub.PreorderInfo, nil
}

func (r *pubsRepo) GetPubsWithAvailableShipping() ([]models.Pub, error) {
	var pubs []models.Pub
	result := r.Database.Joins("JOIN shippings on pubs.shipping_id = shippings.id").Preload("Shipping").Find(&pubs, "shippings.available = ?", true)

	if result.Error != nil {
		return nil, puberrors.ErrUnableToGetPub
	}

	return pubs, nil
}

// Telegram stuff
func (r *pubsRepo) GetPubsWhichHasTelegramUsername(username string) ([]models.Pub, error) {
	pubs := []models.Pub{}
	resp := r.Database.Find(&pubs, "UPPER(telegram_username) = ?", strings.ToUpper(username))
	if resp.Error != nil {
		return nil, puberrors.ErrUnableToGetPub
	}

	return pubs, nil
}

// Couriers
func (r *pubsRepo) AddCourierToPub(pubID int, courierID int) error {
	pub, err := r.GetPubById(pubID)
	if err != nil {
		return err
	}

	courier, err := r.CourierRepo.GetCourierByID(courierID)
	if err != nil {
		fmt.Println("courier error: ", err)
		return err
	}

	fmt.Println("foudn courier: ", courier)

	courierWithID := models.Courier{
		Model: gorm.Model{
			ID: uint(courierID),
		},
	}

	err = r.Database.Model(&pub).Association("Couriers").Append([]models.Courier{courierWithID})
	if err != nil {
		fmt.Println("Unable to add courier error: ", err)
		return puberrors.ErrUnableToAddCourier
	}

	return nil
}

func (r *pubsRepo) RemoveCourierFromPub(pubID int, courierID int) error {
	pub, err := r.GetPubById(pubID)
	if err != nil {
		return err
	}

	courierWithID := models.Courier{
		Model: gorm.Model{
			ID: uint(courierID),
		},
	}

	err = r.Database.Model(&pub).Association("Couriers").Delete([]models.Courier{courierWithID})
	if err != nil {
		fmt.Println("Unable to delete courier from pub error: ", err)
		return puberrors.ErrUnableToDeleteCourierFromPub
	}

	return nil
}

func (r *pubsRepo) UpdatePubDeliveryType(pubID int, deliveryType string) error {
	shipping, err := r.GetShipping(pubID)
	if err != nil {
		return err
	}

	resp := r.Database.
		Model(&models.Shipping{}).
		Where("id = ?", shipping.ID).
		UpdateColumn("delivery_type", deliveryType)

	if resp.Error != nil {
		return puberrors.ErrUnableToUpdateDeliveryType
	}

	return nil
}

func (r *pubsRepo) SetPubAddCommissionToDishPrices(pubID int, addCommission bool) error {
	shipping, err := r.GetShipping(pubID)
	if err != nil {
		return err
	}

	fmt.Println("in repo: ", addCommission)

	resp := r.Database.
		Model(&models.Shipping{}).
		Where("id = ?", shipping.ID).
		UpdateColumn("add_commission_to_dish_prices", addCommission)

	if resp.Error != nil {
		return puberrors.ErrUnableToUpdateDeliveryType
	}

	return nil
}
