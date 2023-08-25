package httphelpers

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/errors/autherrors"
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/currencyerrors"
	"github.com/alexkalak/qrmenu/src/errors/disheserrors"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/errors/menuerrors"
	"github.com/alexkalak/qrmenu/src/errors/oserrors"
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/errors/roleerrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/gofiber/fiber/v2"
)

const (
	AUTOMATIC_STATUS_CODE = 0
)

var errors = map[error]int{
	//Company errors
	companyerrors.ErrCompanyNotFound:                      fiber.StatusNotFound,
	companyerrors.ErrCompanyWithTheSameEmailAlreadyExists: fiber.StatusConflict,
	companyerrors.ErrCompanyWithTheSameNameAlreadyExists:  fiber.StatusConflict,
	companyerrors.ErrUnableToGetCompany:                   fiber.StatusInternalServerError,
	companyerrors.ErrUnableToCreateCompany:                fiber.StatusInternalServerError,
	companyerrors.ErrUnableToUpdateCompany:                fiber.StatusInternalServerError,
	companyerrors.ErrUnableToDeleteCompany:                fiber.StatusInternalServerError,

	//Pub errors
	puberrors.ErrPubNotFound:             fiber.StatusNotFound,
	puberrors.ErrPubURLNameAlreadyExists: fiber.StatusConflict,
	puberrors.ErrUnableToGetPub:          fiber.StatusInternalServerError,
	puberrors.ErrUnableToCreatePub:       fiber.StatusInternalServerError,
	puberrors.ErrUnableToUpdatePub:       fiber.StatusInternalServerError,
	puberrors.ErrUnableToDeletePub:       fiber.StatusInternalServerError,
	puberrors.ErrPubHasBadCompanyID:      fiber.StatusForbidden,
	puberrors.ErrPubHasNoLogo:            fiber.StatusNotFound,
	puberrors.ErrPubHasNoBG:              fiber.StatusNotFound,

	//Menu errors
	menuerrors.ErrNotPubsMenu:              fiber.StatusForbidden,
	menuerrors.ErrMenuNotFound:             fiber.StatusNotFound,
	menuerrors.ErrUnableToGetMenu:          fiber.StatusInternalServerError,
	menuerrors.ErrUnableToCreateMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToUpdateMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToDeleteMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToFreePlaceForMenu: fiber.StatusInternalServerError,

	//Category errors
	categoryerrors.ErrUnableToGetCategory:    fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToCreateCategory: fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToUpdateCategory: fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToUpdateCategory: fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToDeleteCategory: fiber.StatusInternalServerError,
	categoryerrors.ErrCategoryHaveNoImage:    fiber.StatusNotFound,

	//Dish errors
	disheserrors.ErrDishNotFound:       fiber.StatusNotFound,
	disheserrors.ErrUnableToGetDish:    fiber.StatusInternalServerError,
	disheserrors.ErrUnableToCreateDish: fiber.StatusInternalServerError,
	disheserrors.ErrUnableToUpdateDish: fiber.StatusInternalServerError,
	disheserrors.ErrUnableToDeleteDish: fiber.StatusInternalServerError,
	disheserrors.ErrDishHasNoImage:     fiber.StatusNotFound,

	//Currency errors
	currencyerrors.ErrCurrencyNotFound: fiber.StatusNotFound,

	//httperrors
	httperrors.ErrBadID:                fiber.StatusBadRequest,
	httperrors.ErrBadBody:              fiber.StatusBadRequest,
	httperrors.ErrBadDocument:          fiber.StatusBadRequest,
	httperrors.ErrInvalidFileExtension: fiber.StatusBadRequest,
	httperrors.ErrUnauthorized:         fiber.StatusUnauthorized,
	httperrors.ErrForbidden:            fiber.StatusForbidden,

	//oserrors
	oserrors.ErrUnableToCreateDir:  fiber.StatusInternalServerError,
	oserrors.ErrUnableToDeleteFile: fiber.StatusInternalServerError,
	oserrors.ErrUnableToOpenFile:   fiber.StatusInternalServerError,
	oserrors.ErrUnableToSaveFile:   fiber.StatusInternalServerError,

	//servererrors
	servererrors.ErrInternalServerError: fiber.ErrInternalServerError.Code,

	//jwterrors
	jwterrors.ErrNotValidSignature: fiber.StatusUnauthorized,
	jwterrors.ErrNotValidToken:     fiber.StatusUnauthorized,
	jwterrors.ErrTokenExpired:      fiber.StatusUnauthorized,
	jwterrors.ErrEmptyAccessToken:  fiber.StatusUnauthorized,
	jwterrors.ErrEmptyRefreshToken: fiber.StatusUnauthorized,

	//roleerrors
	roleerrors.ErrRoleNotFound: fiber.StatusNotFound,

	//autherrors
	autherrors.ErrInvalidCredentials: fiber.StatusUnauthorized,
}

func SendError(ctx *fiber.Ctx, err error, statusCode int) error {
	if statusCode == AUTOMATIC_STATUS_CODE {
		ctx.SendStatus(GetStatusByError(err))
	} else {
		ctx.SendStatus(statusCode)
	}

	return ctx.JSON(fiber.Map{
		"ok":  false,
		"err": err.Error(),
	})
}

func SendValidationErrors(ctx *fiber.Ctx, validationErrors []input.ValidationError) error {
	ctx.SendStatus(fiber.StatusBadRequest)
	return ctx.JSON(fiber.Map{
		"ok":               false,
		"validationErrors": validationErrors,
	})
}
func GetStatusByError(err error) int {
	code, ok := errors[err]
	if !ok {
		return fiber.StatusInternalServerError
	}

	return code
}
