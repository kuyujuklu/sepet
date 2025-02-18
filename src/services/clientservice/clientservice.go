package clientservice

import (
	"errors"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
	"github.com/alexkalak/qrmenu/src/services/smsservice"
	"golang.org/x/crypto/bcrypt"
)

type ClientService interface {
	GetClientByID(id int) (models.Client, error)
	GetAllClients() ([]models.Client, error)
	RegistrateClient(phone string, name string, password string) (models.Client, error)
	AuthenticateClient(phone string, password string) (models.Client, error)
	GenerateClientRegistrationSession(phone string, name string, password string) (models.PhoneValidationSession, time.Time, error)
	CheckPhoneValidationNumberCorrectness(phone string, number string) (models.PhoneValidationSession, error)
	CheckPhoneValidationNumberCorrectnessWithNewCodeGeneration(phone string, code string) (models.PhoneValidationSession, error)
	CheckPhoneValidationNumberOnlyInDB(phone string, code string) (models.PhoneValidationSession, error)
	RegistrateClientWithHashedPassword(phone string, name string, hashedPassword string) (models.Client, error)
	GenerateClientChangePasswordSession(phone string) (models.PhoneValidationSession, time.Time, error)
	ChangePassword(phone string, password string) (models.Client, error)
	DeleteClient(id int) error
}

type clientService struct {
	ClientRepo clientrepo.ClientRepo
	RoleRepo   rolerepo.RoleRepo
	SmsService smsservice.SmsService
}

func New() ClientService {
	return &clientService{
		ClientRepo: clientrepo.New(),
		RoleRepo:   rolerepo.New(),
		SmsService: smsservice.New(),
	}
}

func (c *clientService) GetClientByID(id int) (models.Client, error) {
	return c.ClientRepo.GetClientByID(id)
}

func (c *clientService) GetAllClients() ([]models.Client, error) {
	return c.ClientRepo.GetAllClients()
}

func (c *clientService) GenerateClientRegistrationSession(phone string, name string, password string) (models.PhoneValidationSession, time.Time, error) {
	_, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err == nil || err != clienterrors.ErrClientNotFound {
		return models.PhoneValidationSession{}, time.Now(), clienterrors.ErrClientWithTheSameNumberAlreadyExists
	}

	alreadyAvailableSessions, err := c.ClientRepo.GetAvailablePhoneValidationSessionsForPhone(phone)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	if len(alreadyAvailableSessions) >= 5 {
		return models.PhoneValidationSession{}, time.Now(), clienterrors.ErrTooManySessions
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), errors.New("hashing error")
	}

	pinID, err := c.SmsService.CreateVerificationSession("+373" + phone)
	fmt.Println("Created pin id: ", pinID)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	session, err := c.ClientRepo.CreatePhoneValidationSession(phone, name, string(hashedPassword), strconv.Itoa(c.generateCode()), pinID)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	nextSessionTime := session.CreatedAt.Add(time.Minute)
	if len(alreadyAvailableSessions) >= 3 {
		nextSessionTime = session.CreatedAt.Add(time.Hour)
	}

	return session, nextSessionTime, nil
}

func (c *clientService) GenerateClientChangePasswordSession(phone string) (models.PhoneValidationSession, time.Time, error) {
	_, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	alreadyAvailableSessions, err := c.ClientRepo.GetAvailablePhoneValidationSessionsForPhone(phone)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	if len(alreadyAvailableSessions) >= 5 {
		return models.PhoneValidationSession{}, time.Now(), clienterrors.ErrTooManySessions
	}

	pinID, err := c.SmsService.CreateVerificationSession("+373" + phone)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	session, err := c.ClientRepo.CreatePhoneValidationSession(phone, "", "", strconv.Itoa(c.generateCode()), pinID)
	if err != nil {
		return models.PhoneValidationSession{}, time.Now(), err
	}

	nextSessionTime := session.CreatedAt.Add(time.Minute)
	if len(alreadyAvailableSessions) >= 3 {
		nextSessionTime = session.CreatedAt.Add(time.Hour)
	}

	return session, nextSessionTime, nil
}

func (c *clientService) CheckPhoneValidationNumberCorrectness(phone string, code string) (models.PhoneValidationSession, error) {
	sessions, err := c.ClientRepo.GetAvailablePhoneValidationSessionsForPhone(phone)
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	if len(sessions) == 0 {
		return models.PhoneValidationSession{}, clienterrors.ErrPhoneValidationSessionNotFound
	}

	sessionWithMaxID := models.PhoneValidationSession{}
	for _, s := range sessions {
		if s.ID >= sessionWithMaxID.ID {
			sessionWithMaxID = s
		}
	}

	err = c.SmsService.CheckVerificationCode(sessionWithMaxID.PinID, "+373"+sessionWithMaxID.Phone, code)
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	return sessionWithMaxID, nil
}

func (c *clientService) CheckPhoneValidationNumberCorrectnessWithNewCodeGeneration(phone string, code string) (models.PhoneValidationSession, error) {
	fmt.Println("code: ", code)
	sessions, err := c.ClientRepo.GetAvailablePhoneValidationSessionsForPhone(phone)
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	if len(sessions) == 0 {
		return models.PhoneValidationSession{}, clienterrors.ErrPhoneValidationSessionNotFound
	}

	sessionWithMaxID := models.PhoneValidationSession{}
	for _, s := range sessions {
		if s.ID >= sessionWithMaxID.ID {
			sessionWithMaxID = s
		}
	}

	err = c.SmsService.CheckVerificationCode(sessionWithMaxID.PinID, "+373"+phone, code)
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	newCode := "change-password-" + strconv.Itoa(c.generateCode())
	fmt.Println("newCOde: ", newCode)

	session, err := c.ClientRepo.CreatePhoneValidationSession(phone, "", "", newCode, "")
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	return session, nil
}

func (c *clientService) CheckPhoneValidationNumberOnlyInDB(phone string, code string) (models.PhoneValidationSession, error) {
	sessions, err := c.ClientRepo.GetAvailablePhoneValidationSessionsForPhone(phone)
	if err != nil {
		return models.PhoneValidationSession{}, err
	}

	if len(sessions) == 0 {
		return models.PhoneValidationSession{}, clienterrors.ErrPhoneValidationSessionNotFound
	}

	for _, session := range sessions {
		if session.Number == code && time.Now().Add(-1*time.Hour).Before(session.CreatedAt) {
			return session, nil
		}
	}

	return models.PhoneValidationSession{}, clienterrors.ErrPhoneValidationSessionHasExpired
}

func (c *clientService) ChangePassword(phone string, password string) (models.Client, error) {
	client, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.Client{}, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return models.Client{}, errors.New("hashing error")
	}

	err = c.ClientRepo.ChangePassword(phone, string(hashedPassword))
	if err != nil {
		return models.Client{}, err
	}
	return client, nil
}

func (c *clientService) RegistrateClient(phone string, name string, password string) (models.Client, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return models.Client{}, errors.New("hashing error")
	}

	return c.RegistrateClientWithHashedPassword(phone, name, string(hashedPassword))
}

func (c *clientService) RegistrateClientWithHashedPassword(phone string, name string, hashedPassword string) (models.Client, error) {
	client, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err == nil {
		fmt.Println("already exists: ", helpers.ConvertToJSON(client))
		return models.Client{}, clienterrors.ErrClientWithTheSameNumberAlreadyExists
	}
	if err != clienterrors.ErrClientNotFound {
		return models.Client{}, err
	}

	return c.CreateClient(models.Client{
		Phone:          phone,
		Name:           name,
		HashedPassword: string(hashedPassword),
	})
}

func (c *clientService) AuthenticateClient(phone string, password string) (models.Client, error) {
	client, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.Client{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(client.HashedPassword), []byte(password)); err != nil {
		return models.Client{}, clienterrors.ErrClientInvalidPassword
	}

	return client, nil
}

func (c *clientService) CreateClient(client models.Client) (models.Client, error) {
	role, err := c.RoleRepo.GetRoleByName(models.CLIENT_ROLE_NAME)
	if err != nil {
		return models.Client{}, err
	}

	client.RoleID = int(role.ID)
	client.Role = role

	return c.ClientRepo.CreateClient(client)
}

func (c *clientService) generateCode() int {
	// from 100_000 up to 999_999
	num := 100_000 + rand.Intn(899_999)
	fmt.Println("Generated num: ", num)
	return num
}

func (c *clientService) DeleteClient(id int) error {
	return c.ClientRepo.DeleteClient(id)
}
