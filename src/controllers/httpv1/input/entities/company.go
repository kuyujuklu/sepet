package entities

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities/entitiesdeps"
	"github.com/alexkalak/qrmenu/src/models"
)

type CompanyInput struct {
	Name     string `json:"name" validate:"required,min=2" example:"My company name"`
	Phone    string `json:"phone" validate:"required,min=7" example:"37377777777"`
	Email    string `json:"email" validate:"email" example:"example@gmail.com"`
	Password string `json:"password" validate:"required,min=8" example:"securepassword"`
	Tariff   string `json:"tariff" validate:"required" example:"basic"`
}

type CompanyOutput struct {
	ID     int    `json:"id" example:"1"`
	Name   string `json:"name" example:"My company name"`
	Phone  string `json:"phone" example:"37377777777"`
	Email  string `json:"email" example:"example@gmail.com"`
	Tariff string `json:"tariff" example:"basic"`
}

func (c *CompanyInput) ConvertToModel() (models.Company, error) {
	tariff, err := entitiesdeps.Deps.TariffService.GetTariffByName(c.Tariff)
	if err != nil {
		return models.Company{}, err
	}

	company := models.Company{
		Name:     c.Name,
		Phone:    c.Phone,
		Email:    c.Email,
		Password: c.Password,
		Tariff:   tariff,
		TariffID: tariff.ID,
	}

	return company, nil
}

func (c *CompanyOutput) FillFromModel(company models.Company) {
	c.ID = int(company.ID)
	c.Name = company.Name
	c.Phone = company.Phone
	c.Email = company.Email
	c.Tariff = company.Tariff.Name
}

type CompanyUpdateTariffInput struct {
	Tariff string `json:"tariff" validate:"required,min=2" example:"My company name"`
}

type CompanyUpdateTariffOutput struct {
	ID     int    `json:"id" example:"1"`
	Tariff string `json:"tariff" example:"basic"`
}
