package courier

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type SetOrderStatusOutput struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set order status to completed
// @Description  order status to completed
// @Tags         courier
// @Param courierID path int true "courier id"
// @Param input body entities.SetOrderStatusInput true "order id"
// @Accept       json
// @Produce      json
// @Success      201  {object} SetOrderStatusOutput
// @Router       /courier/{courierID}/set-order-to-completed [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) SetOrderStatusToCompleted(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetOrderStatusInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.CourierService.SetOrderStatusToCompleted(courierID, input.OrderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusCreated)
}

// @Summary      Set order status to canceled
// @Description  order status to canceled
// @Tags         courier
// @Param courierID path int true "courier id"
// @Param input body entities.SetOrderStatusInput true "order id"
// @Accept       json
// @Produce      json
// @Success      201  {object} SetOrderStatusOutput
// @Router       /courier/{courierID}/set-order-to-canceled [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) SetOrderStatusToCanceled(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetOrderStatusInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.CourierService.SetOrderStatusToCanceled(courierID, input.OrderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusCreated)
}
