package courier

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type registerCourierOutput struct {
	Ok          bool                 `json:"ok" example:"true"`
	Courier     entities.CourierOutput `json:"courier"`
	AccessToken string               `json:"accesstoken"`
}

// @Summary      Register courier
// @Description  Self-service courier signup - creates the account and logs
// @Description  it straight in, same shape as company registration. Profile
// @Description  fields (name, phone, ...) are filled in afterwards via the
// @Description  courier's own profile screen, not at signup time.
// @Tags         courier
// @Param input body entities.CreateCourierInput true "courier email and password"
// @Accept       json
// @Produce      json
// @Success      201  {object}  registerCourierOutput
// @Router       /courier/register [POST]
func (c *courierController) RegisterCourier(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CreateCourierInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	courier, err := c.CourierService.CreateCourier(input.Email, input.Password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CourierOutput{}
	output.FillFromModel(courier)

	role, err := c.RoleService.GetRoleByName(models.COURIER_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(courier.ID), role.SignificanceNumber, models.COURIER_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(courier.ID),
		role.SignificanceNumber,
		models.COURIER_ROLE_NAME,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"courier":     output,
			"accesstoken": accessToken,
		},
		fiber.StatusCreated)
}
