package clientservice

import (
	"fmt"
	"math/rand"
	"slices"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
)

type ClientService interface {
	GetClientByID(id int) (models.Client, error)
	GenerateLoginSession(phone string) (time.Time, error)
	GenerateRegistrationSession(phone string, name string) (time.Time, error)
	HandleRegistrationValidation(phone string, validationNumber int) (models.Client, error)
	HandleAuthenticationValidation(phone string, validationNumber int) (models.Client, error)
}

type clientService struct {
	ClientRepo clientrepo.ClientRepo
	RoleRepo   rolerepo.RoleRepo
}

func New() ClientService {
	return &clientService{
		ClientRepo: clientrepo.New(),
		RoleRepo:   rolerepo.New(),
	}
}

func (c *clientService) GetClientByID(id int) (models.Client, error) {
	return c.ClientRepo.GetClientByID(id)
}

func (c *clientService) GenerateRegistrationSession(phone string, name string) (time.Time, error) {
	sessions, err := c.ClientRepo.GetAllRegistrationSessionsInTimeRange(phone, time.Now().Add(-time.Hour), time.Now())
	if err != nil {
		return time.Time{}, err
	}

	fmt.Println("got sessions length = ", len(sessions))

	if len(sessions) >= 2 {
		lastCreatedSession := slices.MaxFunc(sessions, func(a, b models.RegistrationSession) int {
			return a.CreatedAt.Compare(b.CreatedAt)
		})

		return lastCreatedSession.CreatedAt.Add(time.Hour), clienterrors.ErrTooManyLoginSessions
	}

	session := models.RegistrationSession{
		Phone:            phone,
		Name:             name,
		ValidationNumber: c.generateCode(),
	}

	newSession, err := c.ClientRepo.CreateRegistrationSession(session)
	if err != nil {
		return time.Time{}, err
	}

	sessions = append(sessions, newSession)

	if len(sessions) >= 2 {
		return time.Now().Add(time.Hour), nil
	}

	return time.Now().Add(time.Minute), nil
}

func (c *clientService) HandleRegistrationValidation(phone string, validationNumber int) (models.Client, error) {
	sessions, err := c.ClientRepo.GetAllRegistrationSessionsInTimeRange(phone, time.Now().Add(-time.Hour), time.Now())
	if err != nil {
		return models.Client{}, err
	}

	if len(sessions) == 0 {
		return models.Client{}, clienterrors.ErrInvalidValidationNumber
	}

	isValid := false
	validSession := models.RegistrationSession{}

	for _, session := range sessions {
		if session.ValidationNumber == validationNumber {
			isValid = true
			validSession = session
		}
	}

	if !isValid {
		return models.Client{}, clienterrors.ErrInvalidValidationNumber
	}

	return c.CreateClient(models.Client{
		Phone: validSession.Phone,
		Name:  validSession.Name,
	})
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

func (c *clientService) GenerateLoginSession(phone string) (time.Time, error) {
	sessions, err := c.ClientRepo.GetAllLoginSessionsInTimeRange(phone, time.Now().Add(-time.Hour), time.Now())
	if err != nil {
		return time.Time{}, err
	}

	if len(sessions) >= 2 {
		lastCreatedSession := slices.MaxFunc(sessions, func(a, b models.LoginSession) int {
			return a.CreatedAt.Compare(b.CreatedAt)
		})

		return lastCreatedSession.CreatedAt.Add(time.Hour), clienterrors.ErrTooManyLoginSessions
	}

	session := models.LoginSession{
		Phone:            phone,
		ValidationNumber: c.generateCode(),
	}

	newSession, err := c.ClientRepo.CreateLoginSession(session)
	if err != nil {
		return time.Time{}, err
	}

	sessions = append(sessions, newSession)

	if len(sessions) >= 2 {
		return time.Now().Add(time.Hour), nil
	}

	return time.Now().Add(time.Minute), nil
}

func (c *clientService) HandleAuthenticationValidation(phone string, validationNumber int) (models.Client, error) {
	fmt.Println("handling auth validation")
	sessions, err := c.ClientRepo.GetAllLoginSessionsInTimeRange(phone, time.Now().Add(-time.Hour), time.Now())
	if err != nil {
		return models.Client{}, err
	}

	fmt.Println("sessions: ", sessions)

	if len(sessions) == 0 {
		return models.Client{}, clienterrors.ErrInvalidValidationNumber
	}

	isValid := false
	for _, session := range sessions {
		if session.ValidationNumber == validationNumber {
			isValid = true
		}
	}

	if !isValid {
		return models.Client{}, clienterrors.ErrInvalidValidationNumber
	}

	return c.ClientRepo.GetClientByPhoneNumber(phone)
}

func (c *clientService) generateCode() int {
	// from 100_000 up to 999_999
	num := 100_000 + rand.Intn(899_999)
	fmt.Println("Generated num: ", num)
	return num
}
