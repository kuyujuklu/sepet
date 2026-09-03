package dishesrepo

import (
	"errors"
	"io"
	"math"
	"mime/multipart"
	"os"
	"strings"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/disheserrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Configure() error {
	if err := os.MkdirAll(DISHES_IMAGES_PATH, os.ModePerm); err != nil {
		return err
	}

	return nil
}

const (
	DISHES_IMAGES_PATH = "clientfiles/images/dishes/"
)

type DishesRepo interface {
	GetAllDishes() ([]models.Dish, error)
	GetDishById(id int) (models.Dish, error)
	CreateDish(categoryID int, dish models.Dish) (models.Dish, error)
	UpdateDish(id int, dish models.Dish) (models.Dish, error)
	DeleteDish(id int) error
	GetCompanyID(dishID int) (int, error)
	UploadDishImage(dishID int, fileHeader *multipart.FileHeader) (string, error)
	DeleteDishImage(dishID int) error
	GetImageFileName(dishID int) (string, error)
	GetDishMaxPlace(categoryID int) (int, error)
	SetDishPlace(categoryID int, dishID int, place int) (int, error)
	// BulkUpdateDishPrices applies a percent change (e.g. 10 for +10%, -15
	// for -15%) to every dish's Price within a category, in one
	// transaction. SalePrice is left untouched - it's a deliberate
	// promotional override, not something that should drift with a
	// category-wide bump.
	BulkUpdateDishPrices(categoryID int, percent float64) ([]models.Dish, error)
}

type dishesRepo struct {
	Database *gorm.DB
}

func New() DishesRepo {
	return &dishesRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *dishesRepo) GetAllDishes() ([]models.Dish, error) {
	var dishes []models.Dish

	result := r.Database.Find(&dishes)

	if result.Error != nil {
		return nil, disheserrors.ErrUnableToGetDish
	}

	return dishes, nil
}

func (r *dishesRepo) GetDishById(id int) (models.Dish, error) {
	var dish models.Dish
	result := r.Database.Preload("ModifierGroups.Options").First(&dish, "id = ?", id)
	if result.Error != nil {
		return models.Dish{}, disheserrors.ErrDishNotFound
	}

	return dish, nil
}

func (r *dishesRepo) CreateDish(categoryID int, dish models.Dish) (models.Dish, error) {
	dish.CategoryID = uint(categoryID)
	result := r.Database.Create(&dish)
	if result.Error != nil {
		return models.Dish{}, disheserrors.ErrUnableToCreateDish
	}

	return dish, nil
}

func (r *dishesRepo) UpdateDish(id int, dish models.Dish) (models.Dish, error) {
	dishFromDB, err := r.GetDishById(id)
	if err != nil {
		return models.Dish{}, err
	}

	dish.ID = dishFromDB.ID
	dish.CreatedAt = dishFromDB.CreatedAt

	result := r.Database.Save(&dish)
	if result.Error != nil {
		return models.Dish{}, disheserrors.ErrUnableToUpdateDish
	}

	return dish, nil
}

func (r *dishesRepo) DeleteDish(id int) error {
	result := r.Database.Delete(&models.Dish{}, id)
	if result.Error != nil {
		return disheserrors.ErrUnableToDeleteDish
	}

	return nil
}

func (r *dishesRepo) GetCompanyID(dishID int) (int, error) {
	var dish models.Dish
	err := r.Database.Preload("Category.Menu.Pub.Company").Find(&dish, dishID).Error
	if err != nil {
		return 0, err
	}

	return int(dish.Category.Menu.Pub.Company.ID), nil
}

func (s *dishesRepo) UploadDishImage(dishID int, fileHeader *multipart.FileHeader) (string, error) {
	_, err := s.GetDishById(dishID)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	fileNameSplitted := strings.Split(fileHeader.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	fileName := fileID + "." + fileExtension

	file, err := os.OpenFile(DISHES_IMAGES_PATH+fileName, os.O_CREATE|os.O_WRONLY, 0777)
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

	err = s.Database.Model(&models.Dish{}).Where("id = ?", dishID).UpdateColumn("image_file_name", fileName).Error
	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (s *dishesRepo) DeleteDishImage(dishID int) error {
	category, err := s.GetDishById(dishID)
	if err != nil {
		return err
	}

	if category.ImageFileName == "" {
		return nil
	}

	err = os.Remove(DISHES_IMAGES_PATH + category.ImageFileName)

	if err != nil {
		exists := !errors.Is(err, os.ErrNotExist)
		if exists {
			logs.Error("unable to delete dish image ", err)
			return oserrors.ErrUnableToDeleteFile
		}
	}

	err = s.Database.Model(&models.Dish{}).Where("id = ?", dishID).UpdateColumn("image_file_name", "").Error
	if err != nil {
		return err
	}

	return nil
}

func (r *dishesRepo) GetImageFileName(dishID int) (string, error) {
	dish := models.Dish{}
	resp := r.Database.Find(&dish, "id = ?", dishID)

	if resp.Error != nil {
		return "", disheserrors.ErrDishHasNoImage
	}

	if dish.ImageFileName == "" {
		return "", disheserrors.ErrDishHasNoImage
	}

	return dish.ImageFileName, nil
}

func (r *dishesRepo) GetDishMaxPlace(categoryID int) (int, error) {
	var dish models.Dish
	result := r.Database.Where("category_id = ?", categoryID).Order("place desc").First(&dish)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return 0, nil
		}
		return 0, disheserrors.ErrUnableToGetDish
	}

	return dish.Place, nil
}

func (r *dishesRepo) SetDishPlace(categoryID int, dishID int, place int) (int, error) {
	currentDishWithPlace := models.Dish{}
	result := r.Database.Find(&currentDishWithPlace, "category_id = ? AND place = ?", categoryID, place)
	if result.Error != nil {
		return 0, disheserrors.ErrUnableToFreeSpaceForDish
	}

	dish, err := r.GetDishById(dishID)
	if err != nil {
		return 0, err
	}

	if currentDishWithPlace.ID == dish.ID {
		return dish.Place, nil
	}

	currentDishWithPlace.Place = dish.Place
	dish.Place = place

	result = r.Database.Save(&dish)
	if result.Error != nil {
		return 0, disheserrors.ErrUnableToUpdateDish
	}

	if currentDishWithPlace.ID == 0 {
		return place, nil
	}

	result = r.Database.Save(&currentDishWithPlace)
	if result.Error != nil {
		return 0, disheserrors.ErrUnableToUpdateDish
	}

	return place, nil
}

func (r *dishesRepo) BulkUpdateDishPrices(categoryID int, percent float64) ([]models.Dish, error) {
	var dishes []models.Dish

	err := r.Database.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("category_id = ?", categoryID).Find(&dishes).Error; err != nil {
			return err
		}

		for i := range dishes {
			newPrice := math.Round(dishes[i].Price*(1+percent/100)*100) / 100
			if err := tx.Model(&dishes[i]).Update("price", newPrice).Error; err != nil {
				return err
			}
			dishes[i].Price = newPrice
		}

		return nil
	})
	if err != nil {
		return nil, disheserrors.ErrUnableToUpdateDish
	}

	return dishes, nil
}
