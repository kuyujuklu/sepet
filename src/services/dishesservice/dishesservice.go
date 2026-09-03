package dishesservice

import (
	"mime/multipart"

	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/dishesrepo"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
)

type DishesService interface {
	GetAllDishes() ([]models.Dish, error)
	GetDishById(id int) (models.Dish, error)
	CreateDish(categoryID int, dish models.Dish) (models.Dish, error)
	UpdateDish(id int, dish models.Dish) (models.Dish, error)
	DeleteDish(id int) error
	CheckCompanyAccess(companyID int, dishID int) error
	UploadDishImage(id int, fileHeader *multipart.FileHeader) (string, error)
	GetImageFileName(id int) (string, error)
	MoveDishLeft(dishID int) (int, error)
	MoveDishRight(dishID int) (int, error)
	BulkUpdateDishPrices(categoryID int, percent float64) ([]models.Dish, error)
}

type dishesService struct {
	DishesRepo      dishesrepo.DishesRepo
	CategoryService categoryservice.CategoryService
}

func New() DishesService {
	return &dishesService{
		DishesRepo:      dishesrepo.New(),
		CategoryService: categoryservice.New(),
	}
}

func (s *dishesService) GetAllDishes() ([]models.Dish, error) {
	return s.DishesRepo.GetAllDishes()
}

func (s *dishesService) GetDishById(id int) (models.Dish, error) {
	return s.DishesRepo.GetDishById(id)
}

func (s *dishesService) CreateDish(categoryID int, dish models.Dish) (models.Dish, error) {
	_, err := s.CategoryService.GetCategoryById(int(categoryID))
	if err != nil {
		return models.Dish{}, err
	}

	maxPlace, err := s.DishesRepo.GetDishMaxPlace(categoryID)
	if err != nil {
		return models.Dish{}, err
	}

	dish.Place = maxPlace + 1

	return s.DishesRepo.CreateDish(categoryID, dish)
}

func (s *dishesService) UpdateDish(id int, dish models.Dish) (models.Dish, error) {
	_, err := s.CategoryService.GetCategoryById(int(dish.CategoryID))
	if err != nil {
		return models.Dish{}, err
	}

	dishFromDB, err := s.DishesRepo.GetDishById(id)
	if err != nil {
		return models.Dish{}, err
	}

	dish.CreatedAt = dishFromDB.CreatedAt
	dish.ID = dishFromDB.ID
	dish.ImageFileName = dishFromDB.ImageFileName
	dish.Place = dishFromDB.Place

	return s.DishesRepo.UpdateDish(id, dish)
}

func (s *dishesService) DeleteDish(id int) error {
	return s.DishesRepo.DeleteDish(id)
}

func (s *dishesService) CheckCompanyAccess(companyID int, dishID int) error {
	realCompanyID, err := s.DishesRepo.GetCompanyID(dishID)
	if err != nil {
		return err
	}

	if realCompanyID != companyID {
		return companyerrors.ErrNotCompaniesEntity
	}

	return nil
}

func (s *dishesService) UploadDishImage(id int, fileHeader *multipart.FileHeader) (string, error) {
	err := s.DishesRepo.DeleteDishImage(id)
	if err != nil {
		return "", err
	}

	return s.DishesRepo.UploadDishImage(id, fileHeader)
}

func (s *dishesService) GetImageFileName(id int) (string, error) {
	return s.DishesRepo.GetImageFileName(id)
}

func (s *dishesService) MoveDishLeft(dishID int) (int, error) {
	dish, err := s.DishesRepo.GetDishById(dishID)
	if err != nil {
		return 0, err
	}

	if dish.Place == 1 {
		return 1, nil
	}

	return s.DishesRepo.SetDishPlace(int(dish.CategoryID), dishID, dish.Place-1)
}

func (s *dishesService) BulkUpdateDishPrices(categoryID int, percent float64) ([]models.Dish, error) {
	_, err := s.CategoryService.GetCategoryById(categoryID)
	if err != nil {
		return nil, err
	}

	return s.DishesRepo.BulkUpdateDishPrices(categoryID, percent)
}

func (s *dishesService) MoveDishRight(dishID int) (int, error) {
	dish, err := s.DishesRepo.GetDishById(dishID)
	if err != nil {
		return 0, err
	}

	categoryID := int(dish.CategoryID)

	maxPlace, err := s.DishesRepo.GetDishMaxPlace(categoryID)
	if err != nil {
		return 0, err
	}

	if dish.Place == maxPlace {
		return 0, nil
	}

	if dish.Place > maxPlace {
		return s.DishesRepo.SetDishPlace(categoryID, dishID, maxPlace)
	}

	return s.DishesRepo.SetDishPlace(categoryID, dishID, dish.Place+1)
}
