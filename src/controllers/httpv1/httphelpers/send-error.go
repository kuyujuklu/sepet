package httphelpers

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/errors/adminerrors"
	"github.com/alexkalak/qrmenu/src/errors/autherrors"
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
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
	"github.com/alexkalak/qrmenu/src/errors/tarifferrors"
	"github.com/gofiber/fiber/v2"
)

const (
	AUTOMATIC_STATUS_CODE = 0
)

var errors = map[error]int{
	//Company errors
	companyerrors.ErrCompanyNotFound:                      fiber.StatusNotFound,
	companyerrors.ErrCompanyEntityNotFound:                fiber.StatusNotFound,
	companyerrors.ErrCompanyWithTheSameEmailAlreadyExists: fiber.StatusConflict,
	companyerrors.ErrCompanyWithTheSameNameAlreadyExists:  fiber.StatusConflict,
	companyerrors.ErrPubLimitExceeded:                     fiber.StatusForbidden,
	companyerrors.ErrNotCompaniesEntity:                   fiber.StatusForbidden,
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
	puberrors.ErrUnableToCreateQrCode:    fiber.StatusInternalServerError,
	puberrors.ErrPubHasBadCompanyID:      fiber.StatusForbidden,
	puberrors.ErrPubHasNoLogo:            fiber.StatusNotFound,
	puberrors.ErrPubHasNoBG:              fiber.StatusNotFound,
	puberrors.ErrPubShippingIsInvalid:    fiber.StatusInternalServerError,
	puberrors.ErrPubPreorderIsInvalid:    fiber.StatusInternalServerError,

	//Menu errors
	menuerrors.ErrNotPubsMenu:              fiber.StatusForbidden,
	menuerrors.ErrMenuNotFound:             fiber.StatusNotFound,
	menuerrors.ErrUnableToGetMenu:          fiber.StatusInternalServerError,
	menuerrors.ErrUnableToCreateMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToUpdateMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToDeleteMenu:       fiber.StatusInternalServerError,
	menuerrors.ErrUnableToFreePlaceForMenu: fiber.StatusInternalServerError,

	//Category errors
	categoryerrors.ErrUnableToGetCategory:          fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToCreateCategory:       fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToUpdateCategory:       fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToUpdateCategory:       fiber.StatusInternalServerError,
	categoryerrors.ErrUnableToDeleteCategory:       fiber.StatusInternalServerError,
	categoryerrors.ErrCategoryHaveNoImage:          fiber.StatusNotFound,
	categoryerrors.ErrUnableToFreePlaceForCategory: fiber.StatusInternalServerError,
	categoryerrors.ErrCategoryMenuNotFound:         fiber.StatusNotFound,

	//Dish errors
	disheserrors.ErrDishNotFound:             fiber.StatusNotFound,
	disheserrors.ErrUnableToGetDish:          fiber.StatusInternalServerError,
	disheserrors.ErrUnableToCreateDish:       fiber.StatusInternalServerError,
	disheserrors.ErrUnableToUpdateDish:       fiber.StatusInternalServerError,
	disheserrors.ErrUnableToDeleteDish:       fiber.StatusInternalServerError,
	disheserrors.ErrDishHasNoImage:           fiber.StatusNotFound,
	disheserrors.ErrUnableToFreeSpaceForDish: fiber.StatusInternalServerError,

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

	//tarifferrors
	tarifferrors.ErrTariffNotFound:    fiber.StatusNotFound,
	tarifferrors.ErrUnableToGetTariff: fiber.StatusInternalServerError,

	//autherrors
	autherrors.ErrInvalidCredentials: fiber.StatusUnauthorized,

	//adminerrors
	adminerrors.ErrAdminNotFound:          fiber.StatusNotFound,
	adminerrors.ErrAdminIncorrectPassword: fiber.StatusUnauthorized,

	//clienterror
	clienterrors.ErrClientNotFound:                       fiber.StatusNotFound,
	clienterrors.ErrClientWithTheSameNumberAlreadyExists: fiber.StatusConflict,
	clienterrors.ErrUnableToGetClient:                    fiber.StatusInternalServerError,
	clienterrors.ErrUnableToDeleteClient:                 fiber.StatusInternalServerError,
	clienterrors.ErrUnableToUpdateClient:                 fiber.StatusInternalServerError,
	clienterrors.ErrClientInvalidPassword:                fiber.StatusForbidden,
	clienterrors.ErrInvalidLatitude:                      fiber.StatusBadRequest,
	clienterrors.ErrInvalidLongitude:                     fiber.StatusBadRequest,
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

func SendErrorWithBody(ctx *fiber.Ctx, err error, statusCode int, additionalInfo fiber.Map) error {
	if statusCode == AUTOMATIC_STATUS_CODE {
		ctx.SendStatus(GetStatusByError(err))
	} else {
		ctx.SendStatus(statusCode)
	}

	additionalInfo["ok"] = false
	additionalInfo["err"] = err.Error()

	return ctx.JSON(additionalInfo)
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
