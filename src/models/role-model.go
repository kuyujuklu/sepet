package models

const (
	ADMIN_ROLE_NAME   = "admin"
	COMPANY_ROLE_NAME = "company"
	CLIENT_ROLE_NAME  = "client"
	COURIER_ROLE_NAME = "courier"
)

const (
	ADMIN_SIGNIFICANCE   = 1
	COMPANY_SIGNIFICANCE = 2
	COURIER_SIGNIFICANCE = 2
	CLIENT_SIGNIFICANCE  = 2
)

type Role struct {
	ID                 uint `gorm:"primarykey"`
	Name               string
	SignificanceNumber int
}
