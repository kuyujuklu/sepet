package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type GetOrdersOutput struct {
	Ok     bool                   `json:"ok" example:"true"`
	Err    string                 `json:"err" example:""`
	Orders []entities.OrderOutput `json:"orders"`
}

// @Summary      Get orders
// @Description  gets all orders for user
// @Tags         Order
// @Produce      json
// @Success      200  {object}  GetOrdersOutput
// @Router       /api/client/orders [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetAllOrdersForClient(ctx *fiber.Ctx) error {
	clientID, _, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	orders, err := c.OrderService.GetOrdersForClient(clientID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.OrderOutput, 0, len(orders))

	for _, order := range orders {
		outputOrder := entities.OrderOutput{}
		err := outputOrder.FillFromModel(order)
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}

		output = append(output, outputOrder)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"orders": output,
		},
		fiber.StatusOK)
}

type CreateOrderOutput struct {
	Ok    bool                 `json:"ok" example:"true"`
	Err   string               `json:"err" example:"unable to create order"`
	Order entities.OrderOutput `json:"order"`
}

// @Summary      Create order
// @Description  creates order
// @Tags         Order
// @Param input body entities.CreateOrderInput true "order input"
// @Produce      json
// @Success      200  {object}  CreateOrderOutput
// @Router       /api/client/orders [POST]
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) CreateOrder(ctx *fiber.Ctx) error {
	clientID, _, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.CreateOrderInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	if input.PubID == 0 {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	order, err := input.ConvertToModel()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	order.ClientID = clientID

	order, err = c.OrderService.CreateOrder(order)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.OrderOutput{}
	err = output.FillFromModel(order)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"order": output,
		},
		fiber.StatusOK)
}

// @Summary      Rate order
// @Description  Rate order
// @Tags         Order
// @Param input body entities.RateOrderInput true "order input"
// @Param orderID path int true "order id"
// @Produce      json
// @Success      200  {object}  CreateOrderOutput
// @Router       /api/client/orders/{orderID}/rate [POST]
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) RateOrder(ctx *fiber.Ctx) error {
	fmt.Println("In rate order request")
	clientID, _, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	order, err := c.OrderService.GetOrderByID(orderID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if order.ClientID != clientID {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.RateOrderInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.OrderService.RateOrder(orderID, input.Rating)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}
