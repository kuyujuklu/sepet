package httphelpers

import (
	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/dishesservice"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
)

var pubService = pubservice.New()
var menuService = menuservice.New()
var categoryService = categoryservice.New()
var dishService = dishesservice.New()

func CheckAccess(userID int, companyID int, userSignificance int, entityType models.CompanyEntity, entityID int) error {
	err := CheckAccessForCompanyAction(userID, companyID, userSignificance)
	if err != nil {
		return err
	}

	return CheckAccessForEntity(companyID, entityType, entityID)
}

func CheckAccessForCompanyAction(userID int, companyID int, userSignificance int) error {
	if userSignificance < models.COMPANY_SIGNIFICANCE {
		return nil
	}

	if userID != companyID {
		return httperrors.ErrForbidden
	}

	return nil
}

func CheckAccessForEntity(companyID int, entityType models.CompanyEntity, entityID int) error {
	switch entityType {
	case models.COMPANY_COMPANY_ENTITY:
		return nil
	case models.PUB_COMPANY_ENTITY:
		return pubService.CheckCompanyAccess(companyID, entityID)
	case models.MENU_COMPANY_ENTITY:
		return menuService.CheckCompanyAccess(companyID, entityID)
	case models.CATEGORY_COMPANY_ENTITY:
		return categoryService.CheckCompanyAccess(companyID, entityID)
	case models.DISH_COMPANY_ENTITY:
		return dishService.CheckCompanyAccess(companyID, entityID)
	}

	return companyerrors.ErrCompanyEntityNotFound
}
