package categories

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type getAllCategoriesOutput struct {
	Ok         bool                      `json:"ok" example:"true"`
	Categories []entities.CategoryOutput `json:"categories"`
}

// @Summary      Get category
// @Description  Get info of category
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Produce      json
// @Success      200  {object} getAllCategoriesOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *categoryController) GetAllCategories(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	menuID, err := strconv.Atoi(ctx.Params("menuID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with menu for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.MENU_COMPANY_ENTITY, menuID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	categories, err := c.MenuService.GetAllCategoriesForMenu(menuID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := []entities.CategoryOutput{}
	for _, category := range categories {
		categoryOutput := entities.CategoryOutput{}
		categoryOutput.FillFromModel(category)
		output = append(output, categoryOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"categories": output,
		},
		fiber.StatusOK)
}
