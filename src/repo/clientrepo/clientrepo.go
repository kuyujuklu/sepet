package clientrepo

import (
	"errors"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type ClientRepo interface {
	CreateClient(client models.Client) (models.Client, error)
	GetClientByPhoneNumber(phone string) (models.Client, error)
	GetClientByID(id int) (models.Client, error)
}

type clientRepo struct {
	Database *gorm.DB
}

func New() ClientRepo {
	return &clientRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *clientRepo) GetClientByPhoneNumber(phone string) (models.Client, error) {
	client := models.Client{}
	resp := r.Database.Preload("Role").First(&client, "phone = ?", phone)
	if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
		return models.Client{}, clienterrors.ErrClientNotFound
	}
	if resp.Error != nil {
		return models.Client{}, clienterrors.ErrUnableToGetClient
	}

	return client, nil
}

func (r *clientRepo) GetClientByID(id int) (models.Client, error) {
	client := models.Client{}
	resp := r.Database.Preload("Role").First(&client, "id = ?", id)
	if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
		return models.Client{}, clienterrors.ErrClientNotFound
	}
	if resp.Error != nil {
		return models.Client{}, clienterrors.ErrUnableToGetClient
	}

	return client, nil
}

func (r *clientRepo) CreateClient(client models.Client) (models.Client, error) {
	_, err := r.GetClientByPhoneNumber(client.Phone)
	if err == nil {
		return models.Client{}, clienterrors.ErrClientWithTheSameNumberAlreadyExists
	}
	if err == clienterrors.ErrUnableToGetClient {
		return models.Client{}, err
	}

	resp := r.Database.Preload("Role").Create(&client)
	if resp.Error != nil {
		return models.Client{}, clienterrors.ErrUnableToCreateClient
	}

	return client, nil
}
