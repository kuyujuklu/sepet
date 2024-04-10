package menus

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type getMenuOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Menu entities.MenuOutput `json:"menu"`
}

// @Summary      Get menu
// @Description  Gets info about menu
// @Tags         menu
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Produce      json
// @Success      200  {object}  getMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID} [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *menuController) GetMenuByID(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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
	err = h.CheckAccess(userID, companyID, userSignificance, models.MENU_COMPANY_ENTITY, menuID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	menu, err := c.MenuService.GetMenuById(menuID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.MenuOutput{}
	output.FillFromModel(menu)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"menu": output,
		},
		fiber.StatusOK)
}
