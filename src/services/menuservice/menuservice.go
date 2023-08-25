package menuservice

import (
	"github.com/alexkalak/qrmenu/src/errors/menuerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/menurepo"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
)

type MenuService interface {
	GetAllMenus() ([]models.Menu, error)
	GetMenuById(id int) (models.Menu, error)
	GetAllCategoriesForMenu(id int) ([]models.Category, error)
	CreateMenu(menu models.Menu) (models.Menu, error)
	UpdateMenu(id int, menu models.Menu) (models.Menu, error)
	DeleteMenu(id int) error
}

type menuService struct {
	MenuRepo   menurepo.MenuRepo
	PubService pubservice.PubService
}

func New() MenuService {
	return &menuService{
		MenuRepo:   menurepo.New(),
		PubService: pubservice.New(),
	}
}

func (s *menuService) GetAllMenus() ([]models.Menu, error) {
	return s.MenuRepo.GetAllMenus()
}

func (s *menuService) GetMenuById(id int) (models.Menu, error) {
	return s.MenuRepo.GetMenuById(id)
}

func (s *menuService) GetAllCategoriesForMenu(id int) ([]models.Category, error) {
	_, err := s.GetMenuById(id)
	if err != nil {
		return nil, err
	}

	return s.MenuRepo.GetAllCategoriesForMenu(id)
}

func (s *menuService) CreateMenu(menu models.Menu) (models.Menu, error) {
	_, err := s.PubService.GetPubById(int(menu.PubID))
	if err != nil {
		return models.Menu{}, err
	}

	if menu.Place < 1 {
		return models.Menu{}, menuerrors.ErrUnableToFreePlaceForMenu
	}

	err = s.MenuRepo.FreePlaceForMenu(int(menu.PubID), menu.Place)
	if err != nil {
		return models.Menu{}, err
	}

	return s.MenuRepo.CreateMenu(menu)
}

func (s *menuService) UpdateMenu(id int, menu models.Menu) (models.Menu, error) {
	_, err := s.PubService.GetPubById(int(menu.PubID))
	if err != nil {
		return models.Menu{}, err
	}

	menuFromDB, err := s.MenuRepo.GetMenuById(id)
	if err != nil {
		return models.Menu{}, err
	}

	if menuFromDB.PubID != menu.PubID {
		return models.Menu{}, menuerrors.ErrNotPubsMenu
	}

	menu.ID = uint(id)
	menu.Place = menuFromDB.Place

	err = s.MenuRepo.FreePlaceForMenu(int(menu.PubID), menu.Place)
	if err != nil {
		return models.Menu{}, err
	}

	return s.MenuRepo.UpdateMenu(id, menu)
}

func (s *menuService) DeleteMenu(id int) error {
	return s.MenuRepo.DeleteMenu(id)
}
