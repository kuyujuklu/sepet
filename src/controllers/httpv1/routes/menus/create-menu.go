package menus

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type createMenuOutput struct {
	Ok   bool                `json:"ok" example:"true"`
	Menu entities.MenuOutput `json:"menu"`
}

// @Summary      Create menu
// @Description  Creates menu
// @Tags         menu
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.MenuInput true "menu params"
// @Accept       json
// @Produce      json
// @Success      201  {object}  createMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/ [POST]
// @Security ApiKeyAuth
// @Param access_token header string  true "access_token"
func (c *menuController) CreateMenu(ctx *fiber.Ctx) error {
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

	err = h.CheckAccess(userID, companyID, userSignificance)
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
	menu, err := c.MenuService.CreateMenu(inputMenu)
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
		fiber.StatusCreated)
}
