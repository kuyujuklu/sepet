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

func CheckCompanyAccess(userID int, companyID int, userSignificance int, userRole string, entityType models.CompanyEntity, entityID int) error {
	err := CheckAccessForCompanyAction(userID, companyID, userSignificance, userRole)
	if err != nil {
		return err
	}

	return CheckAccessForEntity(companyID, entityType, entityID)
}

func CheckAccessForCompanyAction(userID int, companyID int, userSignificance int, userRole string) error {
	if userSignificance < models.COMPANY_SIGNIFICANCE {
		return nil
	}

	if userSignificance == models.COMPANY_SIGNIFICANCE && userRole == models.COMPANY_ROLE_NAME && userID == companyID {
		return nil
	}

	return httperrors.ErrForbidden
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

func CheckAccessForCourierAction(userID int, courierID int, userSignificance int, userRole string) error {
	if userSignificance < models.COURIER_SIGNIFICANCE {
		return nil
	}

	if userSignificance == models.COURIER_SIGNIFICANCE && userRole == models.COURIER_ROLE_NAME && userID == courierID {
		return nil
	}

	return httperrors.ErrForbidden
}
