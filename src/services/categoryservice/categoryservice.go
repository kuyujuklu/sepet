package categoryservice

import (
	"mime/multipart"

	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
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
	CheckCompanyAccess(companyID int, categoryID int) error
	UploadCategoryImage(id int, fileHeader *multipart.FileHeader) (string, error)
	GetImageFileName(id int) (string, error)
	MoveCategoryLeft(categoryID int) (int, error)
	MoveCategoryRight(categoryID int) (int, error)
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

	maxPlace, err := s.CategoryRepo.GetCategoryMaxPlace(menuID)
	if err != nil {
		return models.Category{}, err
	}

	category.Place = maxPlace + 1

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
	category.Place = categoryFromDB.Place

	return s.CategoryRepo.UpdateCategory(id, category)
}

func (s *categoryService) DeleteCategory(id int) error {
	return s.CategoryRepo.DeleteCategory(id)
}

func (s *categoryService) CheckCompanyAccess(companyID int, categoryID int) error {
	realCompanyID, err := s.CategoryRepo.GetCompanyID(categoryID)
	if err != nil {
		return err
	}

	if realCompanyID != companyID {
		return companyerrors.ErrNotCompaniesEntity
	}

	return nil
}

func (s *categoryService) UploadCategoryImage(id int, fileHeader *multipart.FileHeader) (string, error) {
	err := s.CategoryRepo.DeleteCategoryImage(id)
	if err != nil {
		return "", err
	}

	return s.CategoryRepo.UploadCategoryImage(id, fileHeader)
}

func (s *categoryService) GetImageFileName(id int) (string, error) {
	return s.CategoryRepo.GetImageFileName(id)
}

func (s *categoryService) MoveCategoryLeft(categoryID int) (int, error) {
	category, err := s.CategoryRepo.GetCategoryById(categoryID)
	if err != nil {
		return 0, err
	}

	if category.Place == 1 {
		return 1, nil
	}

	return s.CategoryRepo.SetCategoryPlace(int(category.MenuID), categoryID, category.Place-1)
}

func (s *categoryService) MoveCategoryRight(categoryID int) (int, error) {
	category, err := s.CategoryRepo.GetCategoryById(categoryID)
	if err != nil {
		return 0, err
	}

	menuID := int(category.MenuID)

	maxPlace, err := s.CategoryRepo.GetCategoryMaxPlace(menuID)
	if err != nil {
		return 0, err
	}

	if category.Place == maxPlace {
		return 0, nil
	}

	if category.Place > maxPlace {
		return s.CategoryRepo.SetCategoryPlace(menuID, categoryID, maxPlace)
	}

	return s.CategoryRepo.SetCategoryPlace(menuID, categoryID, category.Place+1)
}
