package dishes

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type getDishByIDOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Dish entities.DishOutput `json:"dish"`
}

// @Summary      Get dish
// @Description  Get info of dish
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param dishID path int true "dish id"
// @Produce      json
// @Success      200  {object} getDishByIDOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/{dishID} [GET]
// @Security ApiKeyAuth
// @Param access_token header string  true "access_token"
func (c *dishesController) GetDishByID(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccess(userID, companyID, userSignificance)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	dishID, err := strconv.Atoi(ctx.Params("dishID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	dish, err := c.DishService.GetDishById(dishID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.DishOutput{}
	output.ConvertFromModel(dish)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"dish": output,
		},
		fiber.StatusOK)
}
