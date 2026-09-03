package orders

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

// @Summary      Get order status timeline
// @Description  every status this order has been through, with a real timestamp for each
// @Tags         Order
// @Produce      json
// @Param        orderID path int true "order id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/orders/{orderID}/status-events [GET]
func (c *ordersController) GetOrderStatusEvents(ctx *fiber.Ctx) error {
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	events, err := c.OrderService.GetOrderStatusEvents(orderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.OrderStatusEventOutput, 0, len(events))
	for _, event := range events {
		eventOutput := entities.OrderStatusEventOutput{}
		eventOutput.FillFromModel(event)
		output = append(output, eventOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"events": output,
		},
		fiber.StatusOK)
}

// @Summary      Get estimated preparing time
// @Description  average minutes from "preparing" to "at_courier" for recent orders - zone-scoped first, falling back to the pub-wide average when the zone doesn't have enough history yet
// @Tags         Order
// @Produce      json
// @Param        shape_id query string false "delivery zone shape id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/orders/estimated-preparing-minutes [GET]
func (c *ordersController) GetEstimatedPreparingMinutes(ctx *fiber.Ctx) error {
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

	shapeID := ctx.Query("shape_id")

	minutes, sampleCount, basedOn, err := c.OrderService.GetEstimatedPreparingMinutes(pubID, shapeID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"minutes":      minutes,
			"sample_count": sampleCount,
			"based_on":     basedOn,
		},
		fiber.StatusOK)
}
