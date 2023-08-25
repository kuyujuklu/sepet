package companyservice

import (
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/companyrepo"
)

type CompanyService interface {
	Login(email string, password string) (models.Company, error)
	GetAllCompanies() ([]models.Company, error)
	GetCompanyById(id int) (models.Company, error)
	GetAllPubsForCompany(id int) ([]models.Pub, error)
	CreateCompany(company models.Company) (models.Company, error)
	UpdateCompany(id int, company models.Company) (models.Company, error)
	DeleteCompany(id int) error
}

type companyService struct {
	CompanyRepo companyrepo.CompanyRepo
}

func New() CompanyService {
	return &companyService{
		CompanyRepo: companyrepo.New(),
	}
}

func (s *companyService) Login(email string, password string) (models.Company, error) {
	return s.CompanyRepo.Login(email, password)
}

func (s *companyService) GetAllCompanies() ([]models.Company, error) {
	return s.CompanyRepo.GetAllCompanies()
}

func (s *companyService) GetCompanyById(id int) (models.Company, error) {
	return s.CompanyRepo.GetCompanyById(id)
}

func (s *companyService) GetAllPubsForCompany(id int) ([]models.Pub, error) {
	_, err := s.GetCompanyById(id)
	if err != nil {
		return nil, err
	}

	return s.CompanyRepo.GetAllPubsForCompany(id)
}

func (s *companyService) CreateCompany(company models.Company) (models.Company, error) {
	return s.CompanyRepo.CreateCompany(company)
}

func (s *companyService) UpdateCompany(id int, company models.Company) (models.Company, error) {
	return s.CompanyRepo.UpdateCompany(id, company)
}

func (s *companyService) DeleteCompany(id int) error {
	return s.CompanyRepo.DeleteCompany(id)
}
