package clientrepo

import (
	"errors"
	"time"

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
	CreateRegistrationSession(session models.RegistrationSession) (models.RegistrationSession, error)
	CreateLoginSession(session models.LoginSession) (models.LoginSession, error)
	GetAllRegistrationSessionsInTimeRange(phone string, from time.Time, to time.Time) ([]models.RegistrationSession, error)
	GetAllLoginSessionsInTimeRange(phone string, from time.Time, to time.Time) ([]models.LoginSession, error)
}

type clientRepo struct {
	Database *gorm.DB
}

func New() ClientRepo {
	return &clientRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *clientRepo) GetAllRegistrationSessionsInTimeRange(phone string, from time.Time, to time.Time) ([]models.RegistrationSession, error) {
	var sessions = []models.RegistrationSession{}
	resp := r.Database.Find(&sessions, "phone = ? AND created_at > ? AND created_at < ?", phone, from, to)
	if resp.Error != nil {
		return nil, clienterrors.ErrUnableToGetSession
	}

	return sessions, nil
}

func (r *clientRepo) GetAllLoginSessionsInTimeRange(phone string, from time.Time, to time.Time) ([]models.LoginSession, error) {
	var sessions = []models.LoginSession{}
	resp := r.Database.Find(&sessions, "phone = ? AND created_at > ? AND created_at < ?", phone, from, to)
	if resp.Error != nil {
		return nil, clienterrors.ErrUnableToGetSession
	}

	return sessions, nil
}

func (r *clientRepo) CreateRegistrationSession(session models.RegistrationSession) (models.RegistrationSession, error) {
	_, err := r.GetClientByPhoneNumber(session.Phone)
	if err == nil {
		return models.RegistrationSession{}, clienterrors.ErrClientWithTheSameNumberAlreadyExists
	}
	if err != clienterrors.ErrClientNotFound {
		return models.RegistrationSession{}, err
	}

	resp := r.Database.Create(&session)
	if resp.Error != nil {
		return models.RegistrationSession{}, clienterrors.ErrUnableToCreateSession
	}

	return session, nil
}

func (r *clientRepo) CreateLoginSession(session models.LoginSession) (models.LoginSession, error) {
	_, err := r.GetClientByPhoneNumber(session.Phone)
	if err != nil {
		return models.LoginSession{}, err
	}

	resp := r.Database.Create(&session)
	if resp.Error != nil {
		return models.LoginSession{}, clienterrors.ErrUnableToCreateSession
	}

	return session, nil
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
