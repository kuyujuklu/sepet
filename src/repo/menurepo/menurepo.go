package menurepo

import (
	"errors"
	"fmt"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/errors/menuerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type MenuRepo interface {
	GetAllMenus() ([]models.Menu, error)
	GetMenuById(id int) (models.Menu, error)
	GetAllCategoriesForMenu(menuID int) ([]models.Category, error)
	CreateMenu(menu models.Menu) (models.Menu, error)
	FreePlaceForMenu(pubID int, place int) error
	UpdateMenu(id int, menu models.Menu) (models.Menu, error)
	DeleteMenu(id int) error
	SetMenuPlace(pubID int, menuID int, place int) (int, error)
	GetMenuMaxPlace(pubID int) (int, error)
}

type menuRepo struct {
	Database *gorm.DB
}

func New() MenuRepo {
	return &menuRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *menuRepo) GetAllMenus() ([]models.Menu, error) {
	var menus []models.Menu
	result := r.Database.Find(&menus)

	if result.Error != nil {
		return nil, menuerrors.ErrUnableToGetMenu
	}

	return menus, nil
}

func (r *menuRepo) GetMenuById(id int) (models.Menu, error) {
	var menu models.Menu
	result := r.Database.First(&menu, "id = ?", id)

	if result.Error != nil {
		return models.Menu{}, menuerrors.ErrMenuNotFound
	}

	return menu, nil
}

func (r *menuRepo) GetAllCategoriesForMenu(menuID int) ([]models.Category, error) {
	var categories []models.Category
	result := r.Database.Where("menu_id = ?", menuID).Find(&categories)

	if result.Error != nil {
		return nil, categoryerrors.ErrUnableToGetCategory
	}

	return categories, nil
}

func (r *menuRepo) FreePlaceForMenu(pubID int, place int) error {
	result := r.Database.Exec("UPDATE menus SET place = place + 1 WHERE pub_id = ? AND place >= ?", pubID, place)
	if result.Error != nil {
		return menuerrors.ErrUnableToFreePlaceForMenu
	}

	return nil
}

func (r *menuRepo) GetMenuMaxPlace(pubID int) (int, error) {
	var menu models.Menu
	result := r.Database.Where("pub_id = ?", pubID).Order("place desc").First(&menu)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return 0, nil
		}
		return 0, menuerrors.ErrUnableToGetMenu
	}

	return menu.Place, nil
}

func (r *menuRepo) SetMenuPlace(pubID int, menuID int, place int) (int, error) {
	currentMenuWithPlace := models.Menu{}
	result := r.Database.Find(&currentMenuWithPlace, "pub_id = ? AND place = ?", pubID, place)
	if result.Error != nil {
		return 0, menuerrors.ErrUnableToFreePlaceForMenu
	}

	menu, err := r.GetMenuById(menuID)
	if err != nil {
		return 0, err
	}

	if currentMenuWithPlace.ID == menu.ID {
		return menu.Place, nil
	}

	currentMenuWithPlace.Place = menu.Place
	menu.Place = place

	result = r.Database.Save(&menu)
	if result.Error != nil {
		return 0, menuerrors.ErrUnableToUpdateMenu
	}

	if currentMenuWithPlace.ID == 0 {
		return place, nil
	}

	result = r.Database.Save(&currentMenuWithPlace)
	if result.Error != nil {
		return 0, menuerrors.ErrUnableToUpdateMenu
	}

	return place, nil
}

func (r *menuRepo) CreateMenu(menu models.Menu) (models.Menu, error) {
	result := r.Database.Create(&menu)

	if result.Error != nil {
		return models.Menu{}, menuerrors.ErrUnableToCreateMenu
	}
	fmt.Println("menu id ", menu.ID)

	return menu, nil
}

func (r *menuRepo) UpdateMenu(id int, menu models.Menu) (models.Menu, error) {
	menuFromDB, err := r.GetMenuById(id)
	if err != nil {
		return models.Menu{}, err
	}

	menu.CreatedAt = menuFromDB.CreatedAt
	menu.PubID = menuFromDB.PubID

	result := r.Database.Save(&menu)
	if result.Error != nil {
		return models.Menu{}, menuerrors.ErrUnableToUpdateMenu
	}

	return menu, nil
}

func (r *menuRepo) DeleteMenu(id int) error {
	menu, err := r.GetMenuById(id)
	if err != nil {
		return err
	}

	result := r.Database.Exec("UPDATE menus SET place = place - 1 WHERE pub_id = ? AND place > ?", menu.PubID, menu.Place)

	if result.Error != nil {
		return menuerrors.ErrUnableToFreePlaceForMenu
	}

	result = r.Database.Delete(&models.Menu{}, "id = ?", id)

	if result.Error != nil {
		return menuerrors.ErrUnableToDeleteMenu
	}

	return nil
}
