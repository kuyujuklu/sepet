package rolerepo

import (
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/roleerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type RoleRepo interface {
	GetRoleByName(name string) (models.Role, error)
}

type roleRepo struct {
	Database *gorm.DB
}

func New() RoleRepo {
	return &roleRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *roleRepo) GetRoleByName(name string) (models.Role, error) {
	var role models.Role
	result := r.Database.First(&role, "name = ?", name)

	if result.Error != nil {
		return models.Role{}, roleerrors.ErrRoleNotFound
	}

	return role, nil
}
