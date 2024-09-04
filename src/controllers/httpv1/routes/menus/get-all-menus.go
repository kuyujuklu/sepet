package menus

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type getAllMenusOutput struct {
	Ok   bool                  `json:"ok" example:"true"`
	Menu []entities.MenuOutput `json:"menus"`
}

// @Summary      Get all menu
// @Description  Gets all menus for pub
// @Tags         menu
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Produce      json
// @Success      200  {object}  createMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/ [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *menuController) GetAllMenus(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
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

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	menus, err := c.PubService.GetAllMenusForPub(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := []entities.MenuOutput{}
	for _, menu := range menus {
		menuOutput := entities.MenuOutput{}
		menuOutput.FillFromModel(menu)
		output = append(output, menuOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"menus": output,
		},
		fiber.StatusOK)
}
