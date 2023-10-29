package menus

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type updateMenuOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Menu entities.MenuOutput `json:"menu"`
}

// @Summary      Update menu
// @Description  Updates menu
// @Tags         menu
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param input body entities.MenuInput true "menu params"
// @Accept       json
// @Produce      json
// @Success      200 {object}  updateMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID} [PUT]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *menuController) UpdateMenu(ctx *fiber.Ctx) error {
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

	menuID, err := strconv.Atoi(ctx.Params("menuID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with menu for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.MENU_COMPANY_ENTITY, menuID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.MenuInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}
	input.PubID = pubID

	inputMenu := input.ConvertToModel(pubID)
	menu, err := c.MenuService.UpdateMenu(menuID, inputMenu)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.MenuOutput{}
	output.ConvertFromModel(menu)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"menu": output,
		},
		fiber.StatusOK)
}
