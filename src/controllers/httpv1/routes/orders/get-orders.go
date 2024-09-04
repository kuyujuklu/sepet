package orders

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetOrdersOutput struct {
	Ok     bool                   `json:"ok" example:"true"`
	Err    string                 `json:"err" example:""`
	Orders []entities.OrderOutput `json:"orders"`
}

// @Summary      Get orders
// @Description  gets all orders for pub
// @Tags         Pub
// @Produce      json
// @Success      200  {object}  GetOrdersOutput
// @Router       /api/client/orders [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *ordersController) GetAllOrdersForPub(ctx *fiber.Ctx) error {
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

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	orders, err := c.OrderService.GetOrdersForPub(pubID)
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
