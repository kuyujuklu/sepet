package dishes

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type deleteDishOutput struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Delete dish
// @Description  Deletes dish
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param dishID path int true "dish id"
// @Produce      json
// @Success      200 {object}  deleteDishOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/{dishID} [DELETE]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *dishesController) DeleteDish(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	dishID, err := strconv.Atoi(ctx.Params("dishID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with dish for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.DISH_COMPANY_ENTITY, dishID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.DishService.DeleteDish(dishID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusOK)
}
