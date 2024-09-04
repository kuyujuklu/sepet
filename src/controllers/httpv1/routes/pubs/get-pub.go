package pubs

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetPubByIDOutput struct {
	Ok  bool               `json:"ok" example:"true"`
	Pub entities.PubOutput `json:"pub"`
}

// @Summary      Get pub
// @Description  get pub
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetPubByIDOutput
// @Router       /company/{companyID}/pubs/{pubID} [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) GetPubByID(ctx *fiber.Ctx) error {
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

	pub, err := c.PubService.GetPubById(pubID)
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
