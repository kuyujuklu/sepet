package authservice

import (
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/adminservice"
	"github.com/alexkalak/qrmenu/src/services/clientservice"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
)

type AuthService interface {
	Login(adminName string, password string) (models.UserModel, error)
}

type authService struct {
	AdminService   adminservice.AdminService
	ClientService  clientservice.ClientService
	CompanyService companyservice.CompanyService
	CourierService courierservice.CourierService
}

func New() AuthService {
	return &authService{
		AdminService:   adminservice.New(),
		ClientService:  clientservice.New(),
		CompanyService: companyservice.New(),
		CourierService: courierservice.New(),
	}
}

func (s *authService) Login(login string, password string) (models.UserModel, error) {
	//Try to authenticate as admin
	admin, err := s.AdminService.Login(login, password)
	if err == nil {
		return models.UserModel{
			ID:                 int(admin.ID),
			Login:              admin.Name,
			Role:               models.ADMIN_ROLE_NAME,
			SignificanceNumber: models.ADMIN_SIGNIFICANCE,
		}, nil
	}

	//Try to authenticate as client
	client, err := s.ClientService.AuthenticateClient(login, password)
	if err == nil {
		return models.UserModel{
			ID:                 int(client.ID),
			Login:              client.Phone,
			Role:               models.CLIENT_ROLE_NAME,
			SignificanceNumber: models.CLIENT_SIGNIFICANCE,
		}, nil
	}

	//Try to authenticate as company
	company, err := s.CompanyService.Login(login, password)
	if err == nil {
		return models.UserModel{
			ID:                 int(company.ID),
			Login:              company.Email,
			Role:               models.COMPANY_ROLE_NAME,
			SignificanceNumber: models.COMPANY_SIGNIFICANCE,
		}, nil
	}

	//Tryh to authenticate courier
	courier, err := s.CourierService.Login(login, password)
	if err == nil {
		return models.UserModel{
			ID:                 int(courier.ID),
			Login:              courier.Email,
			Role:               models.COURIER_ROLE_NAME,
			SignificanceNumber: models.COURIER_SIGNIFICANCE,
		}, nil
	}

	return models.UserModel{}, httperrors.ErrUnauthorized
}
