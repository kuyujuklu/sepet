package adminrepo

import (
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/adminerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type AdminRepo interface {
	GetAdminByName(adminName string) (models.Admin, error)
}

type adminRepo struct {
	Database *gorm.DB
}

func New() AdminRepo {
	return &adminRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *adminRepo) GetAdminByName(adminName string) (models.Admin, error) {
	var admin models.Admin
	result := r.Database.First(&admin, "name = ?", adminName)
	if result.Error != nil {
		return models.Admin{}, adminerrors.ErrAdminNotFound
	}

	return admin, nil
}
