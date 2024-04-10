package client

import (
	"errors"
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type CreateAuthenticationSessionOutput struct {
	Ok              bool   `json:"ok" example:"true"`
	NextSessionTime string `json:"next_session_time" example:"2006-01-24"`
	Error           string `json:"err" example:"client not found"`
}

// @Summary      Create session for registration
// @Description  return ok if sms was sended
// @Tags         Registration
// @Param input body entities.CreateAuthenticationSessionInput true "authentication input"
// @Produce      json
// @Success      200  {object}  CreateAuthenticationSessionOutput
// @Router       /api/client/authentication [POST]
func (c *clientController) CreateAuthenticationSession(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CreateAuthenticationSessionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	nextSessionTime, err := c.ClientService.GenerateLoginSession(input.Phone)
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

// @Summary      Handle validation for authentication
// @Description  return ok and tokens if successfully authenticated
// @Tags         Authentication
// @Param input body entities.ValidateSessionInput true "validation input"
// @Produce      json
// @Success      200  {object}  ValidationOutput
// @Router       /api/client/authentication/validation [POST]
func (c *clientController) ValidateAuthentication(ctx *fiber.Ctx) error {
	fmt.Println("in validation")
	input, validationErrors, err := input.ParseRequestBody[entities.ValidateSessionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	client, err := c.ClientService.HandleAuthenticationValidation(input.Phone, input.ValidationNumber)
	if err != nil {
		fmt.Println("error: ", err)
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.sendClientTokens(ctx, client)
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" example:"refresh_token"`
}

func (c *clientController) RefreshToken(ctx *fiber.Ctx) error {
	reqInput, _, err := input.ParseRequestBody[RefreshTokenRequest](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	userClaims, valid, err := c.JwtService.ParseJwtTokenString(reqInput.RefreshToken)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !valid {
		return h.SendError(ctx, jwterrors.ErrNotValidSignature, h.AUTOMATIC_STATUS_CODE)
	}

	client, err := c.ClientService.GetClientByID(userClaims.ID)
	if err != nil {
		return h.SendError(
			ctx,
			clienterrors.ErrClientNotFound,
			h.AUTOMATIC_STATUS_CODE,
		)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(client.ID),
		client.Role.SignificanceNumber,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
		},
		fiber.StatusOK)
}
