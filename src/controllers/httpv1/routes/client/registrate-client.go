package client

import (
	"errors"
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type CreateRegistrationSessionOutput struct {
	Ok              bool   `json:"ok" example:"true"`
	NextSessionTime string `json:"next_session_time" example:"2006-01-24"`
	Error           string `json:"err" example:"client not found"`
}

// @Summary      Create session for registration
// @Description  return ok if sms was sended
// @Tags         Registration
// @Param input body entities.CreateRegistrationSessionInput true "registratio input"
// @Produce      json
// @Success      200  {object}  CreateRegistrationSessionOutput
// @Router       /api/client/registration [POST]
func (c *clientController) CreateRegistrationSession(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CreateRegistrationSessionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	nextSessionTime, err := c.ClientService.GenerateRegistrationSession(input.Phone, input.Name)
	if err != nil {
		if errors.Is(err, clienterrors.ErrTooManyLoginSessions) {
			h.SendErrorWithBody(
				ctx,
				err,
				h.AUTOMATIC_STATUS_CODE,
				fiber.Map{
					"next_session_time": helpers.ConvertToStandardApiTime(nextSessionTime),
				},
			)
		}

		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"next_session_time": helpers.ConvertToStandardApiTime(nextSessionTime),
		},
		fiber.StatusOK)
}

type ValidationOutput struct {
	Ok           bool   `json:"ok" example:"true"`
	Error        string `json:"err" example:"invalid validation number"`
	AccessToken  string `json:"access_token" example:"access_token"`
	RefreshToken string `json:"refresh_token" example:"refresh_token"`
}

// @Summary      Handle validation for registration
// @Description  return ok and tokens if successfully registered
// @Tags         Registration
// @Param input body entities.ValidateSessionInput true "validation input"
// @Produce      json
// @Success      200  {object}  ValidationOutput
// @Router       /api/client/registration/validation [POST]
func (c *clientController) ValidateRegistration(ctx *fiber.Ctx) error {
	fmt.Println("in validation")
	input, validationErrors, err := input.ParseRequestBody[entities.ValidateSessionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	fmt.Println("phone: ", input.Phone)
	fmt.Println("number: ", input.ValidationNumber)

	client, err := c.ClientService.HandleRegistrationValidation(input.Phone, input.ValidationNumber)
	if err != nil {
		fmt.Println("error: ", err)
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
