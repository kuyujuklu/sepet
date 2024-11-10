package pubservice

import (
	"errors"
	"fmt"
	"math"
	"mime/multipart"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/currencyservice"
)

const (
	FREE_TRIAL_DAYS = 30
)

type PubService interface {
	GetAllPubs() ([]models.Pub, error)
	GetPubById(id int) (models.Pub, error)
	GetPubByUrlName(urlName string) (models.Pub, error)

	GetAllMenusForPub(id int) ([]models.Menu, error)

	GetAllCategoriesForPub(id int) ([]models.Category, error)
	GetCategoriesWithPreloadedMenuForPubs(pubs []models.Pub) ([]models.Category, error)

	GetAllDishesForPub(id int) ([]models.Dish, error)

	CreatePub(pub models.Pub) (models.Pub, error)
	UpdatePub(id int, pub models.Pub) (models.Pub, error)
	ExtendSubscription(id int, days int) (time.Time, error)
	DeletePub(id int) error

	CheckCompanyAccess(companyID int, categoryID int) error
	UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error)
	UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error)
	GetPubLogoFileName(pubID int) (string, error)
	GetPubBGFileName(pubID int) (string, error)

	SetLatLng(pubID int, lat float64, lng float64) error

	SetShippingAvailable(pubID int, available bool) error
	EnableShippingAndSetShapes(pubID int, shapes []models.Shape) error
	GetShapes(pubID int) ([]models.Shape, error)
	GetShipping(pubID int) (models.Shipping, error)
	SetShippingTime(pubID int, shippingTimeFrom int, shippingTimeTo int) error
	SetShippingWorkingTime(pubID int, start int, end int) error
	SetShippingPrices(pubID int, shippingPrice map[string]float64) error
	SetShippingFreeDeliveryPrices(pubID int, shippingFreeDeliveryPrices map[string]float64) error
	UpdatePubDeliveryType(pubID int, deliveryType string) error
	SetPubAddCommissionToDishPrices(pubID int, addCommission bool) error

	SetCardPreorder(pubID int, available bool) error
	SetCashPreorder(pubID int, available bool) error
	GetPreorderInfo(pubID int) (models.PreorderInfo, error)

	GetPubsWithShippingAvailableForPoint(point models.Vertex) ([]models.Pub, []float64, []float64, error)

	//Couriers
	AddCourierToPub(pubID, courierID int) error
	RemoveCourierFromPub(pubID, courierID int) error
}

type pubsService struct {
	PubsRepo        pubsrepo.PubsRepo
	CompanyService  companyservice.CompanyService
	CurrencyService currencyservice.CurrencyService
}

func New() PubService {
	return &pubsService{
		PubsRepo:        pubsrepo.New(),
		CompanyService:  companyservice.New(),
		CurrencyService: currencyservice.New(),
	}
}

func (s *pubsService) GetAllPubs() ([]models.Pub, error) {
	return s.PubsRepo.GetAllPubs()
}

func (s *pubsService) GetPubById(id int) (models.Pub, error) {
	pub, err := s.PubsRepo.GetPubById(id)
	if err != nil {
		return models.Pub{}, err
	}

	return pub, nil
}

func (s *pubsService) GetPubByUrlName(urlName string) (models.Pub, error) {
	return s.PubsRepo.GetPubByUrlName(urlName)
}

func (s *pubsService) GetAllMenusForPub(id int) ([]models.Menu, error) {
	_, err := s.GetPubById(id)
	if err != nil {
		return nil, err
	}

	return s.PubsRepo.GetAllMenusForPub(id)
}
func (s *pubsService) GetAllCategoriesForPub(id int) ([]models.Category, error) {
	_, err := s.GetPubById(id)
	if err != nil {
		return nil, err
	}

	return s.PubsRepo.GetAllCategoriesForPub(id)
}

func (s *pubsService) GetCategoriesWithPreloadedMenuForPubs(pubs []models.Pub) ([]models.Category, error) {
	return s.PubsRepo.GetCategoriesWithPreloadedMenuForPubs(pubs)
}

func (s *pubsService) GetAllDishesForPub(id int) ([]models.Dish, error) {
	_, err := s.GetPubById(id)
	if err != nil {
		return nil, err
	}

	return s.PubsRepo.GetAllDishesForPub(id)
}

func (s *pubsService) CreatePub(pub models.Pub) (models.Pub, error) {
	bool, err := s.CompanyService.CanCreatePub(int(pub.CompanyID))
	if err != nil {
		return models.Pub{}, err
	}

	if !bool {
		return models.Pub{}, puberrors.ErrUnableToCreatePub
	}

	_, err = s.PubsRepo.GetPubByUrlName(pub.UrlName)
	if err == nil {
		return models.Pub{}, puberrors.ErrPubURLNameAlreadyExists
	}
	if !errors.Is(err, puberrors.ErrPubNotFound) {
		return models.Pub{}, err
	}

	_, err = s.CompanyService.GetCompanyById(int(pub.CompanyID))
	if err != nil {
		return models.Pub{}, err
	}

	//free trial
	pub.ExpirationTime = time.Now().UTC().Add(time.Hour * 24 * FREE_TRIAL_DAYS)

	return s.PubsRepo.CreatePub(pub)
}

func (s *pubsService) UpdatePub(id int, pub models.Pub) (models.Pub, error) {
	_, err := s.CompanyService.GetCompanyById(int(pub.CompanyID))
	if err != nil {
		return models.Pub{}, err
	}

	_, err = s.CurrencyService.GetCurrencyByID(int(pub.CurrencyID))
	if err != nil {
		return models.Pub{}, err
	}

	pubFromDB, err := s.PubsRepo.GetPubById(id)
	if err != nil {
		return models.Pub{}, err
	}

	if pub.CompanyID != pubFromDB.CompanyID {
		return models.Pub{}, puberrors.ErrUnableToUpdatePub
	}

	pub.ID = pubFromDB.ID
	pub.CompanyID = pubFromDB.CompanyID
	pub.Lat = pubFromDB.Lat
	pub.Lng = pubFromDB.Lng
	pub.UrlName = pubFromDB.UrlName
	pub.CreatedAt = pubFromDB.CreatedAt
	pub.BgImageFileName = pubFromDB.BgImageFileName
	pub.QrCodeFileName = pubFromDB.QrCodeFileName
	pub.LogoFileName = pubFromDB.LogoFileName
	pub.ExpirationTime = pubFromDB.ExpirationTime
	pub.PreorderInfoID = pubFromDB.PreorderInfoID
	pub.ShippingID = pubFromDB.ShippingID

	return s.PubsRepo.UpdatePub(id, pub)
}

func (s *pubsService) ExtendSubscription(id int, days int) (time.Time, error) {
	pub, err := s.GetPubById(id)
	if err != nil {
		return time.Unix(0, 0), err
	}

	t := pub.ExpirationTime
	if time.Now().After(t) {
		t = time.Now()
	}

	newTime := t.Add(time.Hour * 24 * time.Duration(days))

	return s.PubsRepo.UpdateExpirationTime(id, newTime)

}

func (s *pubsService) DeletePub(id int) error {
	return s.PubsRepo.DeletePub(id)
}

func (s *pubsService) CheckCompanyAccess(companyID int, pubID int) error {
	realCompanyID, err := s.PubsRepo.GetCompanyID(pubID)
	if err != nil {
		return err
	}

	if realCompanyID != companyID {
		return companyerrors.ErrNotCompaniesEntity
	}

	return nil
}

func (s *pubsService) UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	if pub.LogoFileName != "" {
		err := s.PubsRepo.DeletePubLogo(pubID)
		if err != nil {
			return "", err
		}
	}

	fileName, err := s.PubsRepo.UploadPubLogo(pubID, fileHeader)
	if err != nil {
		return "", err
	}
	return fileName, err
}

func (s *pubsService) UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error) {
	pub, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	if pub.BgImageFileName != "" {
		err := s.PubsRepo.DeletePubBG(pubID)
		if err != nil {
			return "", err
		}
	}

	fileName, err := s.PubsRepo.UploadPubBG(pubID, fileHeader)
	if err != nil {
		return "", err
	}
	return fileName, err
}

func (s *pubsService) GetPubLogoFileName(pubID int) (string, error) {
	return s.PubsRepo.GetPubLogoFileName(pubID)
}

func (s *pubsService) GetPubBGFileName(pubID int) (string, error) {
	return s.PubsRepo.GetPubBGFileName(pubID)
}

func (s *pubsService) SetLatLng(pubID int, lat float64, lng float64) error {
	return s.PubsRepo.SetLatLng(pubID, lat, lng)
}

func (s *pubsService) EnableShippingAndSetShapes(pubID int, shapes []models.Shape) error {
	err := s.PubsRepo.EnableShipping(pubID)
	if err != nil {
		return nil
	}

	err = s.PubsRepo.SetPubShapes(pubID, shapes)
	if err != nil {
		return err
	}

	shipping, err := s.GetShipping(pubID)
	if err != nil {
		return err
	}

	//shipping prices
	existingPrices, err := shipping.GetPrices()
	if err != nil {
		existingPrices = make(map[string]float64)
	}

	newPrices := make(map[string]float64)

	for _, shape := range shapes {
		existingPrice, ok := existingPrices[shape.ShapeID]
		if !ok {
			existingPrice = 0
		}

		newPrices[shape.ShapeID] = existingPrice
	}

	err = s.SetShippingPrices(pubID, newPrices)
	if err != nil {
		return err
	}

	//shipping delivery prices
	existingFreeDeliveryPrices, err := shipping.GetFreeDeliveryPrices()
	if err != nil {
		existingFreeDeliveryPrices = make(map[string]float64)
	}

	newFreeDeliveryPrices := make(map[string]float64)

	for _, shape := range shapes {
		existingPrice, ok := existingFreeDeliveryPrices[shape.ShapeID]
		if !ok {
			existingPrice = 0
		}

		newFreeDeliveryPrices[shape.ShapeID] = existingPrice
	}

	err = s.SetShippingFreeDeliveryPrices(pubID, newFreeDeliveryPrices)
	if err != nil {
		return err
	}

	return nil
}

func (s *pubsService) GetShapes(pubID int) ([]models.Shape, error) {
	return s.PubsRepo.GetPubShapes(pubID)
}

func (s *pubsService) GetShipping(pubID int) (models.Shipping, error) {
	return s.PubsRepo.GetShipping(pubID)
}

func (s *pubsService) SetShippingAvailable(pubID int, available bool) error {
	return s.PubsRepo.SetShippingAvailable(pubID, available)
}

func (s *pubsService) SetCardPreorder(pubID int, available bool) error {
	return s.PubsRepo.SetCardPreorder(pubID, available)
}

func (s *pubsService) SetCashPreorder(pubID int, available bool) error {
	return s.PubsRepo.SetCashPreorder(pubID, available)
}

func (s *pubsService) GetPreorderInfo(pubID int) (models.PreorderInfo, error) {
	return s.PubsRepo.GetPreorderInfo(pubID)
}

func (s *pubsService) SetShippingTime(pubID int, shippingTimeFrom int, shippingTimeTo int) error {
	return s.PubsRepo.SetShippingTime(pubID, shippingTimeFrom, shippingTimeTo)
}

func (s *pubsService) SetShippingWorkingTime(pubID int, start int, end int) error {
	return s.PubsRepo.SetShippingWorkingTime(pubID, start, end)
}

func (s *pubsService) SetShippingPrices(pubID int, shippingPrices map[string]float64) error {
	return s.PubsRepo.SetShippingPrices(pubID, shippingPrices)
}
func (s *pubsService) SetShippingFreeDeliveryPrices(pubID int, shippingFreeDeliveryPrices map[string]float64) error {
	return s.PubsRepo.SetShippingFreeDeliveryPrices(pubID, shippingFreeDeliveryPrices)
}

func (s *pubsService) GetPubsWithShippingAvailableForPoint(point models.Vertex) ([]models.Pub, []float64, []float64, error) {
	pubs, err := s.PubsRepo.GetPubsWithAvailableShipping()
	if err != nil {
		return nil, nil, nil, err
	}
	var availablePubs []models.Pub
	fmt.Println("pubs len: ", len(pubs))

	shippingPrices := make([]float64, 0)
	shippingFreeDeliveryPrices := make([]float64, 0)

	for _, pub := range pubs {
		if pub.IsExpired() {
			continue
		}

		shapes, err := pub.Shipping.GetShapes()
		if err != nil {
			fmt.Println("error getting shapes While getting pubs with shipping available for point: ", err)
			continue
		}

		pubShippingPrices, err := pub.Shipping.GetPrices()
		if err != nil {
			continue
		}
		pubShippingFreeDeliveryPrices, err := pub.Shipping.GetFreeDeliveryPrices()
		if err != nil {
			continue
		}

		nearestShape, isAvailable := s.GetAvailableShape(shapes, point.Lat, point.Lng)

		if pub.Shipping.Available && isAvailable {
			availablePubs = append(availablePubs, pub)

			var price float64 = 0
			var freeDeliveryPrice float64 = 0
			for shapeID, shapePrice := range pubShippingPrices {
				if shapeID == nearestShape.ShapeID {
					price = shapePrice
				}
			}
			for shapeID, shapeFreeDeliveryPrice := range pubShippingFreeDeliveryPrices {
				if shapeID == nearestShape.ShapeID {
					freeDeliveryPrice = shapeFreeDeliveryPrice
				}
			}

			shippingPrices = append(shippingPrices, price)
			shippingFreeDeliveryPrices = append(shippingFreeDeliveryPrices, freeDeliveryPrice)
		}
	}

	return availablePubs, shippingPrices, shippingFreeDeliveryPrices, nil
}

func (s *pubsService) GetAvailableShape(shapes []models.Shape, lat float64, lng float64) (models.Shape, bool) {
	availableShapes := []models.Shape{}
	for _, shape := range shapes {
		if s.IsPointInsidePolygon(shape.Vertices, lat, lng) {
			availableShapes = append(availableShapes, shape)
		}
	}

	if len(availableShapes) == 0 {
		return models.Shape{}, false
	}

	if len(availableShapes) == 1 {
		return availableShapes[0], true
	}

	shape := s.GetNearestPolygon(lat, lng, availableShapes)
	return shape, true
}

func (s *pubsService) GetNearestPolygon(lat float64, lng float64, shapes []models.Shape) models.Shape {
	distanceArray := make([]float64, len(shapes))
	for i, shape := range shapes {
		for _, vertex := range shape.Vertices {
			var katet1sqr float64 = math.Abs(lat-vertex.Lat) * math.Abs(lat-vertex.Lat)
			var katet2sqr float64 = math.Abs(lng-vertex.Lng) * math.Abs(lng-vertex.Lng)
			distanceArray[i] += math.Sqrt(katet1sqr + katet2sqr)
		}
	}

	minIndex := 0
	for i, distance := range distanceArray {
		if distance < distanceArray[minIndex] {
			minIndex = i
		}
	}

	return shapes[minIndex]
}

func (s *pubsService) IsPointInsidePolygon(vertices []models.Vertex, lat float64, lng float64) bool {
	length := len(vertices)
	count := 0

	for i := 0; i < length; i++ {
		var x1 float64 = 0
		var y1 float64 = 0
		var x2 float64 = 0
		var y2 float64 = 0

		x1 = vertices[i].Lat
		y1 = vertices[i].Lng

		if i == length-1 {
			x2 = vertices[0].Lat
			y2 = vertices[0].Lng
		} else {
			x2 = vertices[i+1].Lat
			y2 = vertices[i+1].Lng
		}

		if (lng < y1) != (lng < y2) &&
			lat < x1+((lng-y1)/(y2-y1))*(x2-x1) {
			count++
		}
	}

	return count%2 == 1
}

func (s *pubsService) AddCourierToPub(pubID, courierID int) error {
	return s.PubsRepo.AddCourierToPub(pubID, courierID)
}

func (s *pubsService) RemoveCourierFromPub(pubID, courierID int) error {
	return s.PubsRepo.RemoveCourierFromPub(pubID, courierID)
}

func (s *pubsService) UpdatePubDeliveryType(pubID int, deliveryType string) error {
	return s.PubsRepo.UpdatePubDeliveryType(pubID, deliveryType)
}
func (s *pubsService) SetPubAddCommissionToDishPrices(pubID int, addCommission bool) error {
	fmt.Println("al;ksdjfl;aksjdfl;asf")

	return s.PubsRepo.SetPubAddCommissionToDishPrices(pubID, addCommission)
}
