package dishes

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type updateDishOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Dish entities.DishOutput `json:"dish"`
}

// @Summary      Update dish
// @Description  Updates dish
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param dishID path int true "dish id"
// @Param input body entities.DishInput true "dish params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updateDishOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/{dishID} [PUT]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *dishesController) UpdateDish(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	categoryID, err := strconv.Atoi(ctx.Params("categoryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	dishID, err := strconv.Atoi(ctx.Params("dishID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with category for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.CATEGORY_COMPANY_ENTITY, categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with dish for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.DISH_COMPANY_ENTITY, dishID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.DishInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	inputDish := input.ConvertToModel(categoryID)
	dish, err := c.DishService.UpdateDish(dishID, inputDish)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.DishOutput{}
	output.FillFromModel(dish)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"dish": output,
		},
		fiber.StatusOK)
}
