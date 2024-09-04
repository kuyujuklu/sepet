package courier

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type ReserveOrderOutput struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Reserve order
// @Description  Reserves order
// @Tags         courier
// @Param courierID path int true "courier id"
// @Param input body entities.ReserveOrderInput true "order id"
// @Accept       json
// @Produce      json
// @Success      201  {object}  ReserveOrderOutput
// @Router       /courier/{courierID}/reserve-order [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) ReserveOrder(ctx *fiber.Ctx) error {
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

	input, validationErrors, err := input.ParseRequestBody[entities.ReserveOrderInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.CourierService.ReserveOrder(courierID, input.OrderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusCreated)
}
