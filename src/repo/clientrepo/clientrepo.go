package clientrepo

import (
	"errors"
	"fmt"
	"time"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/helpers"
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
	GetAllClients() ([]models.Client, error)
	GetAllPhoneValidationSessionsForPhone(phone string) ([]models.PhoneValidationSession, error)
	GetAvailablePhoneValidationSessionsForPhone(phone string) ([]models.PhoneValidationSession, error)
	CreatePhoneValidationSession(phone string, name string, hashedPassword string, code string, pinID string, provider string) (models.PhoneValidationSession, error)
	ChangePassword(phone string, hashedPassword string) error
	DeleteClient(id int) error
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

func (r *clientRepo) GetAllClients() ([]models.Client, error) {
	clients := []models.Client{}
	resp := r.Database.Preload("Role").Find(&clients)

	if resp.Error != nil {
		return nil, clienterrors.ErrUnableToGetClient
	}

	return clients, nil
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

func (r *clientRepo) GetAllPhoneValidationSessionsForPhone(phone string) ([]models.PhoneValidationSession, error) {
	validationSessions := make([]models.PhoneValidationSession, 0)

	resp := r.Database.Find(&validationSessions, "phone = ?", phone)
	if resp.Error != nil {
		return nil, clienterrors.ErrUnableToGetClientPhoneValidationSessions
	}

	return validationSessions, nil
}

func (r *clientRepo) GetAvailablePhoneValidationSessionsForPhone(phone string) ([]models.PhoneValidationSession, error) {
	validationSessions := make([]models.PhoneValidationSession, 0)

	resp := r.Database.Find(&validationSessions, "phone = ? AND created_at > ?", phone, time.Now().Add(-time.Hour))
	if resp.Error != nil {
		return nil, clienterrors.ErrUnableToGetClientPhoneValidationSessions
	}

	fmt.Println("validation sessions", helpers.ConvertToJSON(validationSessions))

	return validationSessions, nil
}

func (r *clientRepo) ChangePassword(phone string, hashedPassword string) error {
	_, err := r.GetClientByPhoneNumber(phone)
	if err != nil {
		return err
	}

	resp := r.Database.Model(models.Client{}).Where("phone = ?", phone).UpdateColumn("hashed_password", hashedPassword)
	if resp.Error != nil {
		return clienterrors.ErrUnableToChangePassword
	}

	return nil
}

func (r *clientRepo) CreatePhoneValidationSession(phone string, name string, hashedPassword string, code string, pinID string, provider string) (models.PhoneValidationSession, error) {
	session := models.PhoneValidationSession{
		Name:           name,
		Phone:          phone,
		HashedPassword: hashedPassword,
		Number:         code,
		PinID:          pinID,
		Provider:       provider,
	}

	resp := r.Database.Create(&session)
	if resp.Error != nil {
		return models.PhoneValidationSession{}, clienterrors.ErrUnableToCreateClientPhoneValidationSession
	}

	return session, nil
}

func (r *clientRepo) DeleteClient(id int) error {
	resp := r.Database.Delete(&models.Client{}, "id = ?", id)
	if resp.Error != nil {
		return clienterrors.ErrUnableToCreateClientPhoneValidationSession
	}

	return nil
}
