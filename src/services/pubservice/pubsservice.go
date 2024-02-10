package pubservice

import (
	"errors"
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

	SetShippingAvailable(pubID int, available bool) error
	EnableShippingAndSetShapes(pubID int, shapes []models.Shape) error
	GetShapes(pubID int) ([]models.Shape, error)
	GetShipping(pubID int) (models.Shipping, error)
	SetCardPreorder(pubID int, available bool) error
	SetCashPreorder(pubID int, available bool) error
	GetPreorderInfo(pubID int) (models.PreorderInfo, error)
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
	if err != nil && !errors.Is(err, puberrors.ErrPubNotFound) {
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
	pub.UrlName = pubFromDB.UrlName
	pub.CreatedAt = pubFromDB.CreatedAt
	pub.BgImageFileName = pubFromDB.BgImageFileName
	pub.QrCodeFileName = pubFromDB.QrCodeFileName
	pub.LogoFileName = pubFromDB.LogoFileName
	pub.ExpirationTime = pubFromDB.ExpirationTime

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

func (s *pubsService) EnableShippingAndSetShapes(pubID int, shapes []models.Shape) error {
	err := s.PubsRepo.EnableShipping(pubID)
	if err != nil {
		return nil
	}

	return s.PubsRepo.SetPubShapes(pubID, shapes)
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
