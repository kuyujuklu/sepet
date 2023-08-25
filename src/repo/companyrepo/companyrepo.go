package companyrepo

import (
	"errors"
	"fmt"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/autherrors"
	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type CompanyRepo interface {
	Login(email string, password string) (models.Company, error)
	GetAllCompanies() ([]models.Company, error)
	GetCompanyById(id int) (models.Company, error)
	GetAllPubsForCompany(companyId int) ([]models.Pub, error)
	CreateCompany(company models.Company) (models.Company, error)
	UpdateCompany(id int, company models.Company) (models.Company, error)
	DeleteCompany(id int) error
}

type companiesRepo struct {
	Database *gorm.DB
}

func New() CompanyRepo {
	return &companiesRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *companiesRepo) Login(email string, password string) (models.Company, error) {
	company := models.Company{}
	resp := r.Database.First(&company, "email = ?", email)
	if resp.Error != nil {
		return models.Company{}, autherrors.ErrInvalidCredentials
	}

	err := bcrypt.CompareHashAndPassword([]byte(company.Password), []byte(password))
	if err != nil {
		return models.Company{}, autherrors.ErrInvalidCredentials
	}

	return company, nil
}

func (r *companiesRepo) GetAllCompanies() ([]models.Company, error) {
	var companies []models.Company
	result := r.Database.Find(&companies)

	if result.Error != nil {
		return nil, companyerrors.ErrUnableToGetCompany
	}

	return companies, nil
}

func (r *companiesRepo) GetCompanyById(id int) (models.Company, error) {
	var company models.Company
	result := r.Database.First(&company, "id = ?", id)

	if result.Error != nil {
		return models.Company{}, companyerrors.ErrCompanyNotFound
	}

	return company, nil
}

func (r *companiesRepo) GetAllPubsForCompany(companyId int) ([]models.Pub, error) {
	var pubs []models.Pub
	result := r.Database.Where("company_id = ?", companyId).Find(&pubs)

	if result.Error != nil {
		return nil, puberrors.ErrUnableToGetPub
	}

	return pubs, nil
}

func (r *companiesRepo) CreateCompany(company models.Company) (models.Company, error) {
	err := r.checkIfCompanyExists(company)
	if err != nil {
		return models.Company{}, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(company.Password), 10)
	if err != nil {
		return models.Company{}, errors.New("hashing error")
	}

	company.RoleID = 2
	company.Password = string(hashedPassword)

	result := r.Database.Create(&company)

	if result.Error != nil {
		return models.Company{}, companyerrors.ErrUnableToCreateCompany
	}

	return company, nil
}

func (r *companiesRepo) checkIfCompanyExists(company models.Company) error {
	companyFromDB := models.Company{}

	res := r.Database.Find(&companyFromDB, "email = ?", company.Email)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	if companyFromDB.ID != 0 {
		fmt.Println("company with the same email exists", companyFromDB.ID, companyFromDB.Email, company.Email)
		return companyerrors.ErrCompanyWithTheSameEmailAlreadyExists
	}

	companyFromDB = models.Company{}
	res = r.Database.Find(&companyFromDB, "name = ?", company.Name)
	if res.Error != nil {
		return servererrors.ErrInternalServerError
	}

	if companyFromDB.ID != 0 {
		return companyerrors.ErrCompanyWithTheSameNameAlreadyExists
	}

	return nil
}

func (r *companiesRepo) UpdateCompany(id int, company models.Company) (models.Company, error) {
	companyFromDB, err := r.GetCompanyById(id)
	if err != nil {
		return models.Company{}, err
	}
	company.ID = uint(id)
	company.Password = companyFromDB.Password
	company.RoleID = companyFromDB.RoleID
	company.CreatedAt = companyFromDB.CreatedAt

	res := r.Database.Save(&company)
	if res.Error != nil {
		return models.Company{}, companyerrors.ErrUnableToUpdateCompany
	}

	return company, nil
}

func (r *companiesRepo) DeleteCompany(id int) error {
	res := r.Database.Delete(&models.Company{}, "id = ?", id)
	if res.Error != nil {
		return companyerrors.ErrUnableToDeleteCompany
	}

	return nil
}
