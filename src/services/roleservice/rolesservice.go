package roleservice

import (
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/rolerepo"
)

type RoleService interface {
	GetRoleByName(name string) (models.Role, error)
}

type roleService struct {
	RoleRepo rolerepo.RoleRepo
}

func New() RoleService {
	return &roleService{
		RoleRepo: rolerepo.New(),
	}
}

func (s *roleService) GetRoleByName(name string) (models.Role, error) {
	return s.RoleRepo.GetRoleByName(name)
}
