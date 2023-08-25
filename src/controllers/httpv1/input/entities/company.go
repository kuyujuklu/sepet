package entities

import (
	"github.com/alexkalak/qrmenu/src/models"
)

type CompanyInput struct {
	Name     string `json:"name" validate:"required,min=2" example:"My company name"`
	Phone    string `json:"phone" validate:"required,min=7" example:"37377777777"`
	Email    string `json:"email" validate:"email" example:"example@gmail.com"`
	Password string `json:"password" validate:"required,min=8" example:"securepassword"`
}

type CompanyOutput struct {
	ID    int    `json:"id" example:"1"`
	Name  string `json:"name" example:"My company name"`
	Phone string `json:"phone" example:"37377777777"`
	Email string `json:"email" example:"example@gmail.com"`
}

func (c *CompanyInput) ConvertToModel() (models.Company, error) {
	company := models.Company{
		Name:     c.Name,
		Phone:    c.Phone,
		Email:    c.Email,
		Password: c.Password,
	}

	return company, nil
}

func (c *CompanyOutput) ConvertFromModel(company models.Company) {
	c.ID = int(company.ID)
	c.Name = company.Name
	c.Phone = company.Phone
	c.Email = company.Email
}
