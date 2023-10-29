package companies

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type getCompanyOutput struct {
	Ok      bool                   `json:"ok" example:"true"`
	Company entities.CompanyOutput `json:"company"`
}

// @Summary      Get company info
// @Description  returns company info
// @Tags         company
// @Accept       json
// @Param id path int true "company id"
// @Produce      json
// @Success      200  {object}  getCompanyOutput
// @Router       /company/{id} [get]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *companiesController) GetCompanyByID(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//TODO: remove zero at the end
	err = h.CheckAccessForCompanyAction(userID, companyID, userSignificance)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	company, err := c.CompanyService.GetCompanyById(companyID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CompanyOutput{}
	output.ConvertFromModel(company)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"company": output,
		},
		fiber.StatusOK)
}
