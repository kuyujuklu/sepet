package companies

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type createCompanyOutput struct {
	Ok           bool                   `json:"ok" example:"true"`
	Company      entities.CompanyOutput `json:"company"`
	Access_token string                 `json:"accesstoken"`
}

// @Summary      Create company
// @Description  Creates company
// @Tags         company
// @Param input body entities.CompanyInput true "company params"
// @Accept       json
// @Produce      json
// @Success      201  {object}  createCompanyOutput
// @Router       /company/ [POST]
func (c *companiesController) CreateCompany(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CompanyInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	inputCompany, err := input.ConvertToModel()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	company, err := c.CompanyService.CreateCompany(inputCompany)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CompanyOutput{}
	output.FillFromModel(company)

	//Cookies
	role, err := c.RoleService.GetRoleByName(models.COMPANY_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(company.ID), role.SignificanceNumber)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	AccessToken, err := c.JwtService.GetAccessTokenString(
		int(company.ID),
		role.SignificanceNumber,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	//Return response with AccessToken
	return h.SendSuccess(
		ctx,
		fiber.Map{
			"company":     output,
			"accesstoken": AccessToken,
		},
		fiber.StatusCreated)
}
