package pubs

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetPubPreorderInfo struct {
	Ok           bool `json:"ok" example:"true"`
	CardPreorder bool `json:"card_preorder"`
	CashPreorder bool `json:"cash_preorder"`
}

// @Summary      Get preorder info
// @Description  Gets  preorder info
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  SetShippingShapes
// @Router       /company/{companyID}/pubs/{pubID}/preorder [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) GetPubPreorderInfo(ctx *fiber.Ctx) error {
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

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	preorder, err := c.PubService.GetPreorderInfo(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok":            true,
			"card_preorder": preorder.CardPreorder,
			"cash_preorder": preorder.CashPreorder,
		},
		fiber.StatusOK)
}

type SetPubPreorder struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set preorder
// @Description  sets preorder for pub
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetPubPreorder true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetPubPreorder
// @Router       /company/{companyID}/pubs/{pubID}/shipping-availability [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetPubPreorder(ctx *fiber.Ctx) error {
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

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetPubPreorder](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetCardPreorder(pubID, input.CardPreorder)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	err = c.PubService.SetCashPreorder(pubID, input.CashPreorder)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}
