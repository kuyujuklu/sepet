package client

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type RegistrateeClientOutput struct {
	Ok           bool   `json:"ok" example:"true"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	Error        string `json:"err" example:"client not found"`
}

// @Summary      Create session for registration
// @Description  return ok if sms was sended
// @Tags         Registration
// @Param input body entities.RegistrateClientInput true "registratio input"
// @Produce      json
// @Success      200  {object}  RegistrateeClientOutput
// @Router       /api/client/registration [POST]
func (c *clientController) RegistrateClient(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.RegistrateClientInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	client, err := c.ClientService.RegistrateClient(input.Phone, input.Name, input.Password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.sendClientTokens(ctx, client)
}

func (c *clientController) sendClientTokens(ctx *fiber.Ctx, client models.Client) error {
	accessToken, err := c.JwtService.GetAccessTokenString(
		int(client.ID),
		models.CLIENT_SIGNIFICANCE,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		fmt.Println("error: ", err)
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	refreshToken, err := c.JwtService.GetRefreshTokenString(
		int(client.ID),
		models.CLIENT_SIGNIFICANCE,
		jwtservice.STANDARD_REFRESH_LIFE_TIME)

	if err != nil {
		fmt.Println("error: ", err)
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
		},
		fiber.StatusOK)
}
