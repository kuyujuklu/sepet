package orders

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type UpdateOrderStatusOutput struct {
	Ok  bool   `json:"ok" example:"true"`
	Err string `json:"err" example:""`
}

// @Summary      Update order status
// @Description  updates order status
// @Tags         Pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param status query string true "pub params"
// @Produce      json
// @Success      200  {object}  UpdateOrderStatusOutput
// @Router       /api/company/{companyID}/pubs/{pubID}/orders/update-status?status={} [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *ordersController) UpdateOrderStatus(ctx *fiber.Ctx) error {
	status := ctx.Query("status")
	err := models.CheckOrderStatusCorrectness(status)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.OrderService.UpdateOrderStatus(orderID, status)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusOK)
}
