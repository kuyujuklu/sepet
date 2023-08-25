package models

const (
	ADMIN_ROLE_NAME   = "admin"
	COMPANY_ROLE_NAME = "company"
)

const (
	ADMIN_SIGNIFICANCE   = 1
	COMPANY_SIGNIFICANCE = 2
)

type Role struct {
	ID                 uint `gorm:"primarykey"`
	Name               string
	SignificanceNumber int
}
