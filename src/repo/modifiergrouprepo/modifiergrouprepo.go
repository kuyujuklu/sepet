package modifiergrouprepo

import (
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type ModifierGroupRepo interface {
	GetAllGroupsForPub(pubID int) ([]models.ModifierGroup, error)
	GetGroupByID(id int) (models.ModifierGroup, error)
	CreateGroup(pubID int, group models.ModifierGroup) (models.ModifierGroup, error)
	// UpdateGroup replaces the group's name and its full set of options -
	// existing options are deleted and the given ones re-inserted, rather
	// than diffed by ID, since the admin UI always submits the complete
	// option list for a group.
	UpdateGroup(id int, group models.ModifierGroup) (models.ModifierGroup, error)
	DeleteGroup(id int) error

	// GetOptionsByIDs is used by order pricing to resolve submitted
	// modifier-option IDs to their real, server-trusted price deltas.
	GetOptionsByIDs(ids []int) ([]models.ModifierOption, error)
	// GetGroupIDsForDish is used by order pricing to validate that a
	// submitted modifier option actually belongs to a group assigned to the
	// dish being ordered, not just any option that happens to exist.
	GetGroupIDsForDish(dishID int) ([]uint, error)

	// SetDishModifierGroups replaces the full set of modifier groups
	// assigned to a dish (many2many), used from the dish create/update
	// handlers.
	SetDishModifierGroups(dishID int, groupIDs []int) error
}

type modifierGroupRepo struct {
	Database *gorm.DB
}

func New() ModifierGroupRepo {
	return &modifierGroupRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *modifierGroupRepo) GetAllGroupsForPub(pubID int) ([]models.ModifierGroup, error) {
	var groups []models.ModifierGroup
	result := r.Database.Preload("Options").Where("pub_id = ?", pubID).Find(&groups)
	if result.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return groups, nil
}

func (r *modifierGroupRepo) GetGroupByID(id int) (models.ModifierGroup, error) {
	var group models.ModifierGroup
	result := r.Database.Preload("Options").First(&group, id)
	if result.Error != nil {
		return models.ModifierGroup{}, servererrors.ErrInternalServerError
	}

	return group, nil
}

func (r *modifierGroupRepo) CreateGroup(pubID int, group models.ModifierGroup) (models.ModifierGroup, error) {
	group.PubID = uint(pubID)
	result := r.Database.Create(&group)
	if result.Error != nil {
		return models.ModifierGroup{}, servererrors.ErrInternalServerError
	}

	return group, nil
}

func (r *modifierGroupRepo) UpdateGroup(id int, group models.ModifierGroup) (models.ModifierGroup, error) {
	var updated models.ModifierGroup

	err := r.Database.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.ModifierGroup{}).Where("id = ?", id).Update("name", group.Name).Error; err != nil {
			return err
		}

		if err := tx.Where("modifier_group_id = ?", id).Delete(&models.ModifierOption{}).Error; err != nil {
			return err
		}

		for i := range group.Options {
			group.Options[i].ID = 0
			group.Options[i].ModifierGroupID = uint(id)
		}
		if len(group.Options) > 0 {
			if err := tx.Create(&group.Options).Error; err != nil {
				return err
			}
		}

		return tx.Preload("Options").First(&updated, id).Error
	})
	if err != nil {
		return models.ModifierGroup{}, servererrors.ErrInternalServerError
	}

	return updated, nil
}

func (r *modifierGroupRepo) DeleteGroup(id int) error {
	err := r.Database.Transaction(func(tx *gorm.DB) error {
		group := models.ModifierGroup{}
		group.ID = uint(id)

		if err := tx.Model(&group).Association("Dishes").Clear(); err != nil {
			return err
		}

		if err := tx.Where("modifier_group_id = ?", id).Delete(&models.ModifierOption{}).Error; err != nil {
			return err
		}

		return tx.Delete(&models.ModifierGroup{}, id).Error
	})
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (r *modifierGroupRepo) GetOptionsByIDs(ids []int) ([]models.ModifierOption, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	var options []models.ModifierOption
	result := r.Database.Where("id IN ?", ids).Find(&options)
	if result.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return options, nil
}

func (r *modifierGroupRepo) GetGroupIDsForDish(dishID int) ([]uint, error) {
	dish := models.Dish{}
	dish.ID = uint(dishID)

	var groups []models.ModifierGroup
	if err := r.Database.Model(&dish).Association("ModifierGroups").Find(&groups); err != nil {
		return nil, servererrors.ErrInternalServerError
	}

	ids := make([]uint, 0, len(groups))
	for _, group := range groups {
		ids = append(ids, group.ID)
	}

	return ids, nil
}

func (r *modifierGroupRepo) SetDishModifierGroups(dishID int, groupIDs []int) error {
	dish := models.Dish{}
	dish.ID = uint(dishID)

	groups := make([]models.ModifierGroup, 0, len(groupIDs))
	for _, id := range groupIDs {
		groups = append(groups, models.ModifierGroup{Model: gorm.Model{ID: uint(id)}})
	}

	if err := r.Database.Model(&dish).Association("ModifierGroups").Replace(groups); err != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}
