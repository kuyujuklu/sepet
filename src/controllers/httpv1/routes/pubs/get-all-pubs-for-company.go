package pubs

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type GetAllPubsForCompanyOutput struct {
	Ok   bool                 `json:"ok" example:"true"`
	Pubs []entities.PubOutput `json:"pubs"`
}

// @Summary      Get all pubs
// @Description  get all pubs for company
// @Tags         pub
// @Param companyID path int true "company id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetAllPubsForCompanyOutput
// @Router       /company/{companyID}/pubs [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) GetAllPubs(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccessForCompanyAction(userID, companyID, userSignificance)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	pubs, err := c.CompanyService.GetAllPubsForCompany(companyID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := []entities.PubOutput{}
	for _, pub := range pubs {
		outputPub := entities.PubOutput{}
		err = outputPub.FillFromModel(pub)
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}

		output = append(output, outputPub)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"pubs": output,
		},
		fiber.StatusOK)
}
