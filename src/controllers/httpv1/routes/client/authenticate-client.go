package client

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

type AuthenticateClientOutput struct {
	Ok           bool   `json:"ok" example:"true"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	Error        string `json:"err" example:"client not found"`
}

// @Summary      Authenticate client by password
// @Description azadsf
// @Tags         Registration
// @Param input body entities.AuthenticateClientInput true "authentication input"
// @Produce      json
// @Success      200  {object}  AuthenticateClientOutput
// @Router       /api/client/authentication [POST]
func (c *clientController) AuthenticateClient(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.AuthenticateClientInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	client, err := c.ClientService.AuthenticateClient(input.Phone, input.Password)
	if err != nil {
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
		fmt.Println("jwt error not equal to nil ")
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !valid {
		fmt.Println("not valid")
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

	clientOutput := entities.ClientOutput{}
	clientOutput.FillFromModel(client)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
			"client":      clientOutput,
		},
		fiber.StatusOK)
}
