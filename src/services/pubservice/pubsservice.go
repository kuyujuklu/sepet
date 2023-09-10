package pubservice

import (
	"mime/multipart"

	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/companyrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/currencyservice"
)

type PubService interface {
	GetAllPubs() ([]models.Pub, error)
	GetPubById(id int) (models.Pub, error)
	GetAllMenusForPub(id int) ([]models.Menu, error)
	GetAllCategoriesForPub(id int) ([]models.Category, error)
	GetAllDishesForPub(id int) ([]models.Dish, error)
	CreatePub(pub models.Pub) (models.Pub, error)
	UpdatePub(id int, pub models.Pub) (models.Pub, error)
	DeletePub(id int) error
	UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error)
	UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error)
	GetPubLogoFileName(pubID int) (string, error)
	GetPubBGFileName(pubID int) (string, error)
}

type pubsService struct {
	PubsRepo        pubsrepo.PubsRepo
	CompanyService  companyservice.CompanyService
	CurrencyService currencyservice.CurrencyService
}

func New() PubService {
	return &pubsService{
		PubsRepo:        pubsrepo.New(),
		CompanyService:  companyrepo.New(),
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
	_, err := s.CompanyService.GetCompanyById(int(pub.CompanyID))
	if err != nil {
		return models.Pub{}, err
	}
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
	pub.CreatedAt = pubFromDB.CreatedAt
	pub.BgImageFileName = pubFromDB.BgImageFileName
	pub.LogoFileName = pubFromDB.LogoFileName

	return s.PubsRepo.UpdatePub(id, pub)
}

func (s *pubsService) DeletePub(id int) error {
	return s.PubsRepo.DeletePub(id)
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
