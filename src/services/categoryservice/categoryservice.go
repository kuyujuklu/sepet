package categoryservice

import (
	"mime/multipart"

	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/categoryrepo"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
)

type CategoryService interface {
	GetAllCategories() ([]models.Category, error)
	GetCategoryById(id int) (models.Category, error)
	GetAllDishesForCategory(id int) ([]models.Dish, error)
	CreateCategory(category models.Category, menuID int) (models.Category, error)
	UpdateCategory(id int, category models.Category, menuID int) (models.Category, error)
	DeleteCategory(id int) error
	UploadCategoryImage(id int, fileHeader *multipart.FileHeader) (string, error)
	GetImageFileName(id int) (string, error)
}

type categoryService struct {
	CategoryRepo categoryrepo.CategoryRepo
	MenuService  menuservice.MenuService
}

func New() CategoryService {
	return &categoryService{
		CategoryRepo: categoryrepo.New(),
		MenuService:  menuservice.New(),
	}
}

func (s *categoryService) GetAllCategories() ([]models.Category, error) {
	return s.CategoryRepo.GetAllCategories()
}

func (s *categoryService) GetCategoryById(id int) (models.Category, error) {
	return s.CategoryRepo.GetCategoryById(id)
}

func (s *categoryService) GetAllDishesForCategory(id int) ([]models.Dish, error) {
	_, err := s.GetCategoryById(id)
	if err != nil {
		return nil, err
	}

	return s.CategoryRepo.GetAllDishesForCategory(id)
}

func (s *categoryService) CreateCategory(category models.Category, menuID int) (models.Category, error) {
	_, err := s.MenuService.GetMenuById(menuID)
	if err != nil {
		return models.Category{}, err
	}

	return s.CategoryRepo.CreateCategory(category)
}

func (s *categoryService) UpdateCategory(id int, category models.Category, menuID int) (models.Category, error) {
	_, err := s.MenuService.GetMenuById(menuID)
	if err != nil {
		return models.Category{}, err
	}

	categoryFromDB, err := s.GetCategoryById(id)
	if err != nil {
		return models.Category{}, err
	}

	category.MenuID = categoryFromDB.MenuID
	category.CreatedAt = categoryFromDB.CreatedAt
	category.ImageFileName = categoryFromDB.ImageFileName

	return s.CategoryRepo.UpdateCategory(id, category)
}

func (s *categoryService) DeleteCategory(id int) error {
	return s.CategoryRepo.DeleteCategory(id)
}

func (s *categoryService) UploadCategoryImage(id int, fileHeader *multipart.FileHeader) (string, error) {
	return s.CategoryRepo.UploadCategoryImage(id, fileHeader)
}

func (s *categoryService) GetImageFileName(id int) (string, error) {
	return s.CategoryRepo.GetImageFileName(id)
}
