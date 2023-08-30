package dishesservice

import (
	"mime/multipart"

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
	UploadDishImage(id int, fileHeader *multipart.FileHeader) (string, error)
	GetImageFileName(id int) (string, error)
	MoveDishLeft(categoryID int, dishID int) (int, error)
	MoveDishRight(categoryID int, dishID int) (int, error)
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

func (s *dishesService) MoveDishLeft(categoryID int, dishID int) (int, error) {
	_, err := s.CategoryService.GetCategoryById(categoryID)
	if err != nil {
		return 0, err
	}

	dish, err := s.DishesRepo.GetDishById(dishID)
	if err != nil {
		return 0, err
	}

	if dish.Place == 1 {
		return 1, nil
	}

	return s.DishesRepo.SetDishPlace(categoryID, dishID, dish.Place-1)
}

func (s *dishesService) MoveDishRight(categoryID int, dishID int) (int, error) {
	_, err := s.CategoryService.GetCategoryById(categoryID)
	if err != nil {
		return 0, err
	}

	dish, err := s.DishesRepo.GetDishById(dishID)
	if err != nil {
		return 0, err
	}

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
