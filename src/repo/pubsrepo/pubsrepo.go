package pubsrepo

import (
	"errors"
	"io"
	"mime/multipart"
	"os"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/menuerrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/menurepo"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Configure() error {
	if err := os.MkdirAll(PUB_LOGO_FILE_PATH, os.ModePerm); err != nil {
		return err
	}

	if err := os.MkdirAll(PUB_BACKGROUND_FILE_PATH, os.ModePerm); err != nil {
		return err
	}

	return nil
}

const (
	PUB_LOGO_FILE_PATH       = "clientfiles/images/pubs/logos/"
	PUB_BACKGROUND_FILE_PATH = "clientfiles/images/pubs/bgs/"
)

type PubsRepo interface {
	GetAllPubs() ([]models.Pub, error)
	GetAllMenusForPub(pubID int) ([]models.Menu, error)
	GetPubById(id int) (models.Pub, error)
	CreatePub(pub models.Pub) (models.Pub, error)
	UpdatePub(id int, pub models.Pub) (models.Pub, error)
	DeletePub(id int) error
	UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error)
	UploadPubBG(pubID int, fileHeader *multipart.FileHeader) (string, error)
	DeletePubLogo(shipmentID int) error
	DeletePubBG(shipmentID int) error
	GetPubLogoFileName(pubID int) (string, error)
	GetPubBGFileName(pubID int) (string, error)
}

type pubsRepo struct {
	Database *gorm.DB
	MenuRepo menurepo.MenuRepo
}

func New() PubsRepo {
	return &pubsRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *pubsRepo) GetAllPubs() ([]models.Pub, error) {
	var pubs []models.Pub
	result := r.Database.Find(&pubs)

	if result.Error != nil {
		return nil, puberrors.ErrUnableToGetPub
	}

	return pubs, nil
}

func (r *pubsRepo) GetPubById(id int) (models.Pub, error) {
	var pub models.Pub
	result := r.Database.First(&pub, "id = ?", id)

	if result.Error != nil {
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

func (r *pubsRepo) CreatePub(pub models.Pub) (models.Pub, error) {
	result := r.Database.Create(&pub)

	if result.Error != nil {
		return models.Pub{}, puberrors.ErrUnableToCreatePub
	}

	return pub, nil
}

func (r *pubsRepo) UpdatePub(id int, pub models.Pub) (models.Pub, error) {
	result := r.Database.Save(&pub)

	if result.Error != nil {
		return models.Pub{}, puberrors.ErrUnableToUpdatePub
	}

	return pub, nil
}

func (r *pubsRepo) DeletePub(id int) error {
	result := r.Database.Delete(&models.Pub{}, id)

	if result.Error != nil {
		return puberrors.ErrUnableToDeletePub
	}

	return nil
}

func (s *pubsRepo) UploadPubLogo(pubID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := s.GetPubById(pubID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileName := fileID + "." + fileHeader.Filename

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
	fileName := fileID + "." + fileHeader.Filename

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
