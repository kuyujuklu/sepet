package courier

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type GetCourierOrderStatusEventsOutput struct {
	Events []entities.OrderStatusEventOutput `json:"events"`
}

// @Summary      Get order status timeline (courier)
// @Description  every status this order has been through, with a real timestamp for each - only for the order's own reserving courier
// @Tags         courier
// @Param courierID path int true "courier id"
// @Param orderID path int true "order id"
// @Produce      json
// @Success      200  {object}  GetCourierOrderStatusEventsOutput
// @Router       /courier/{courierID}/orders/{orderID}/status-events [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) GetCourierOrderStatusEvents(ctx *fiber.Ctx) error {
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	events, err := c.CourierService.GetCourierOrderStatusEvents(courierID, orderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.OrderStatusEventOutput, 0, len(events))
	for _, event := range events {
		eventOutput := entities.OrderStatusEventOutput{}
		eventOutput.FillFromModel(event)
		output = append(output, eventOutput)
	}

	return h.SendSuccess(ctx, fiber.Map{"events": output}, fiber.StatusOK)
}
