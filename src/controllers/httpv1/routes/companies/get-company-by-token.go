package companies

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type getCompanyByTokenOutput struct {
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
// @Router       /company/ [get]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *companiesController) GetCompanyByAccessToken(ctx *fiber.Ctx) error {
	companyID, _, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if userRole != models.COMPANY_ROLE_NAME {
		fmt.Println("role name: ", userRole)
		return h.SendError(ctx, httperrors.ErrUnauthorized, h.AUTOMATIC_STATUS_CODE)
	}

	company, err := c.CompanyService.GetCompanyById(companyID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CompanyOutput{}
	output.FillFromModel(company)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"company": output,
		},
		fiber.StatusOK)
}
