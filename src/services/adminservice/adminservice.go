package adminservice

import (
	"github.com/alexkalak/qrmenu/src/errors/adminerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/adminrepo"
)

type AdminService interface {
	Login(adminName string, password string) (models.Admin, error)
}

type adminService struct {
	AdminRepo adminrepo.AdminRepo
}

func New() AdminService {
	return &adminService{
		AdminRepo: adminrepo.New(),
	}
}

func (s *adminService) Login(adminName string, password string) (models.Admin, error) {
	admin, err := s.AdminRepo.GetAdminByName(adminName)
	if err != nil {
		return models.Admin{}, err
	}

	if admin.Password != password {
		return models.Admin{}, adminerrors.ErrAdminIncorrectPassword
	}

	return admin, nil
}
