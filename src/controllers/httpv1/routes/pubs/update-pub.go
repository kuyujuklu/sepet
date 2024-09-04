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

type UpdatePubOutput struct {
	Ok  bool               `json:"ok" example:"true"`
	Pub entities.PubOutput `json:"pub"`
}

// @Summary      Update pub
// @Description  Updates pub
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdatePubInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  UpdatePubOutput
// @Router       /company/{companyID}/pubs/{pubID} [PUT]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) UpdatePub(ctx *fiber.Ctx) error {
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

	input, validationErrors, err := input.ParseRequestBody[entities.UpdatePubInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	inputPub := input.ConvertToModel(companyID, pubID)
	pub, err := c.PubService.UpdatePub(pubID, inputPub)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.PubOutput{}
	output.FillFromModel(pub)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"pub": output,
		},
		fiber.StatusOK)
}

type UpdatePubExpirationTimeOutput struct {
	Ok  bool               `json:"ok" example:"true"`
	Pub entities.PubOutput `json:"pub"`
}
