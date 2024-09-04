package clientservice

import (
	"errors"
	"fmt"
	"math/rand"

	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
	"golang.org/x/crypto/bcrypt"
)

type ClientService interface {
	GetClientByID(id int) (models.Client, error)
	RegistrateClient(phone string, name string, password string) (models.Client, error)
	AuthenticateClient(phone string, password string) (models.Client, error)
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

func (c *clientService) RegistrateClient(phone string, name string, password string) (models.Client, error) {
	_, err := c.ClientRepo.GetClientByPhoneNumber(phone)
	if err == nil {
		return models.Client{}, clienterrors.ErrClientWithTheSameNumberAlreadyExists
	}
	if err != clienterrors.ErrClientNotFound {
		return models.Client{}, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return models.Client{}, errors.New("hashing error")
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
