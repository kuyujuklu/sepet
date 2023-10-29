package models

import "gorm.io/gorm"

var TariffLimits = map[string]int{
	BASIC_TARIFF:    1,
	PRO_TARIFF:      5,
	BUSINESS_TARIFF: 1000000,
}

type CompanyEntity string

const (
	COMPANY_COMPANY_ENTITY  CompanyEntity = "company_company_entity"
	PUB_COMPANY_ENTITY      CompanyEntity = "pub_company_entity"
	MENU_COMPANY_ENTITY     CompanyEntity = "menu_company_entity"
	CATEGORY_COMPANY_ENTITY CompanyEntity = "category_company_entity"
	DISH_COMPANY_ENTITY     CompanyEntity = "dish_company_entity"
)

type Company struct {
	gorm.Model
	Name     string
	Phone    string
	Email    string
	Password string
	Pubs     []Pub

	RoleID uint
	Role   Role //always company

	TariffID uint
	Tariff   Tariff
}
