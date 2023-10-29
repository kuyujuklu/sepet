package categories

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type getCategoryOutput struct {
	Ok       bool                    `json:"ok" example:"true"`
	Category entities.CategoryOutput `json:"category"`
}

// @Summary      Get category
// @Description  Get info of category
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Produce      json
// @Success      200  {object} getCategoryOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID} [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *categoryController) GetCategory(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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

	//Checking access for action with category for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.CATEGORY_COMPANY_ENTITY, categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	category, err := c.CategoryService.GetCategoryById(categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CategoryOutput{}
	output.ConvertFromModel(category)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"category": output,
		},
		fiber.StatusOK)
}
