package pubs

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type AddCourierOutput struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Add courier to pub
// @Description  add courier to
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.PubCourierActionInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      201  {object}  entities.PubCourierActionInput
// @Router       /company/{companyID}/pubs/{pubID}/couriers [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) AddCourier(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.PubCourierActionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.AddCourierToPub(pubID, input.CourierID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusCreated)
}

// @Summary      Remove courier from pub
// @Description  Remove courier from pub
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param courierID path int true "courier id"
// @Accept       json
// @Produce      json
// @Success      201  {object}  entities.PubCourierActionInput
// @Router       /company/{companyID}/pubs/{pubID}/couriers/{courierID} [DELETE]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) RemoveCourier(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.PubService.RemoveCourierFromPub(pubID, courierID)
	if err != nil {
		return err
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusCreated)
}
