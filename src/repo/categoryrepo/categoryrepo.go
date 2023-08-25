package categoryrepo

import (
	"errors"
	"io"
	"mime/multipart"
	"os"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/errors/disheserrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Configure() error {
	if err := os.MkdirAll(CATEGORY_IMAGES_PATH, os.ModePerm); err != nil {
		return err
	}

	return nil
}

const (
	CATEGORY_IMAGES_PATH = "clientfiles/images/categories/"
)

type CategoryRepo interface {
	GetAllCategories() ([]models.Category, error)
	GetCategoryById(id int) (models.Category, error)
	GetAllDishesForCategory(categoryID int) ([]models.Dish, error)
	CreateCategory(category models.Category) (models.Category, error)
	UpdateCategory(id int, category models.Category) (models.Category, error)
	DeleteCategory(id int) error
	UploadCategoryImage(categoryID int, fileHeader *multipart.FileHeader) (string, error)
	DeleteCategoryImage(categoryID int) error
	GetImageFileName(id int) (string, error)
}

type categoryRepo struct {
	Database *gorm.DB
}

func New() CategoryRepo {
	return &categoryRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *categoryRepo) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	result := r.Database.Find(&categories)

	if result.Error != nil {
		return nil, categoryerrors.ErrUnableToGetCategory
	}

	return categories, nil
}

func (r *categoryRepo) GetCategoryById(id int) (models.Category, error) {
	var category models.Category
	result := r.Database.First(&category, "id = ?", id)

	if result.Error != nil {
		return models.Category{}, categoryerrors.ErrCategoryNotFound
	}

	return category, nil
}

func (r *categoryRepo) CreateCategory(category models.Category) (models.Category, error) {
	result := r.Database.Create(&category)

	if result.Error != nil {
		return models.Category{}, categoryerrors.ErrUnableToCreateCategory
	}

	return category, nil
}

func (r *categoryRepo) UpdateCategory(id int, category models.Category) (models.Category, error) {
	categoryFromDB, err := r.GetCategoryById(id)
	if err != nil {
		return models.Category{}, err
	}

	category.CreatedAt = categoryFromDB.CreatedAt
	category.ID = categoryFromDB.ID
	category.Place = categoryFromDB.Place

	result := r.Database.Save(&category)

	if result.Error != nil {
		return models.Category{}, categoryerrors.ErrUnableToUpdateCategory
	}

	return category, nil
}

func (r *categoryRepo) DeleteCategory(id int) error {
	result := r.Database.Delete(&models.Category{}, id)

	if result.Error != nil {
		return categoryerrors.ErrUnableToDeleteCategory
	}

	return nil
}

func (r *categoryRepo) GetAllDishesForCategory(categoryID int) ([]models.Dish, error) {
	var dishes []models.Dish
	res := r.Database.Find(&dishes)

	if res.Error != nil {
		return nil, disheserrors.ErrUnableToGetDish
	}

	return dishes, nil
}

func (s *categoryRepo) UploadCategoryImage(categoryID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := s.GetCategoryById(categoryID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileName := fileID + "." + fileHeader.Filename

	file, err := os.OpenFile(CATEGORY_IMAGES_PATH+fileName, os.O_CREATE|os.O_WRONLY, 0777)
	if err != nil {
		return "", oserrors.ErrUnableToOpenFile
	}
	defer file.Close()

	src, err := fileHeader.Open()
	if err != nil {
		return "", oserrors.ErrUnableToOpenFile
	}
	defer src.Close()

	_, err = io.Copy(file, src)
	if err != nil {
		return "", oserrors.ErrUnableToSaveFile
	}

	err = s.Database.Model(&models.Category{}).Where("id = ?", categoryID).UpdateColumn("image_file_name", fileName).Error
	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (s *categoryRepo) DeleteCategoryImage(categoryID int) error {
	pub, err := s.GetCategoryById(categoryID)
	if err != nil {
		return err
	}

	err = os.Remove(CATEGORY_IMAGES_PATH + pub.ImageFileName)

	if err != nil {
		exists := !errors.Is(err, os.ErrNotExist)
		if exists {
			logs.Error("unable to delete category image ", err)
			return oserrors.ErrUnableToDeleteFile
		}
	}

	err = s.Database.Model(&models.Category{}).Where("id = ?", categoryID).UpdateColumn("image_file_name", "").Error
	if err != nil {
		return err
	}

	return nil
}

func (r *categoryRepo) GetImageFileName(id int) (string, error) {
	var category models.Category
	result := r.Database.First(&category, "id = ?", id)

	if result.Error != nil {
		return "", categoryerrors.ErrCategoryHaveNoImage
	}

	return category.ImageFileName, nil
}
