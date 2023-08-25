package dishes

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type createDishOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Dish entities.DishOutput `json:"dish"`
}

// @Summary      Create dish
// @Description  Creates dish
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param input body entities.DishInput true "menu params"
// @Accept       json
// @Produce      json
// @Success      201  {object}  createDishOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/ [POST]
// @Security ApiKeyAuth
// @Param access_token header string  true "access_token"
func (c *dishesController) CreateDish(ctx *fiber.Ctx) error {
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

	categoryID, err := strconv.Atoi(ctx.Params("categoryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.DishInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	inputDish := input.ConvertToModel(categoryID)
	dish, err := c.DishService.CreateDish(categoryID, inputDish)
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
		fiber.StatusCreated)
}
