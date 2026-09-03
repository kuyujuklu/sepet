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

type bulkUpdateDishPricesOutput struct {
	Ok     bool                  `json:"ok" example:"true"`
	Dishes []entities.DishOutput `json:"dishes"`
}

// @Summary      Bulk update dish prices
// @Description  applies a percent change to every dish's price in a category, in one action
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param input body entities.BulkPriceInput true "percent change"
// @Accept       json
// @Produce      json
// @Success      200  {object}  bulkUpdateDishPricesOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/bulk-price [PATCH]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *dishesController) BulkUpdateDishPrices(ctx *fiber.Ctx) error {
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

	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.CATEGORY_COMPANY_ENTITY, categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	bulkInput, validationErrors, err := input.ParseRequestBody[entities.BulkPriceInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	dishes, err := c.DishService.BulkUpdateDishPrices(categoryID, bulkInput.Percent)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.DishOutput, 0, len(dishes))
	for _, dish := range dishes {
		dishOutput := entities.DishOutput{}
		dishOutput.FillFromModel(dish)
		output = append(output, dishOutput)
	}

	return h.SendSuccess(ctx, fiber.Map{"dishes": output}, fiber.StatusOK)
}
