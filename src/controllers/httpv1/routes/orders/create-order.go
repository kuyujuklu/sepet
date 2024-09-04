package orders

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type CreateOrderOutput struct {
	Ok    bool                 `json:"ok" example:"true"`
	Err   string               `json:"err" example:"unable to create order"`
	Order entities.OrderOutput `json:"order"`
}

// @Summary      Create order without authorization
// @Description  creates order without authroization
// @Tags         Order
// @Param input body entities.CreateOrderInput true "order input"
// @Produce      json
// @Success      200  {object}  CreateOrderOutput
// @Router       /api/orders/ [POST]
func (c *ordersController) CreateOrder(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CreateOrderInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	fmt.Println("DeliveryPrice in order creation: ", input.DeliveryPrice)

	if input.PubID == 0 {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	order, err := input.ConvertToModel()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	order, err = c.OrderService.CreateOrderForUnknownClient(order)
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
