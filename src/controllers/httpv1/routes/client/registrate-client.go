package client

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/helpers"
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

func (c *clientController) GenerateClientRegistrationSession(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.RegistrateClientInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	_, nextSessionTime, err := c.ClientService.GenerateClientRegistrationSession(input.Phone, input.Name, input.Password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{
		"next_session_time": helpers.ConvertToStandardApiTime(nextSessionTime),
	}, h.AUTOMATIC_STATUS_CODE)
}

func (c *clientController) RegistrateBySessionNumber(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.RegistrateBySessionNumberInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	session, err := c.ClientService.CheckPhoneValidationNumberCorrectness(input.Phone, input.Number)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	fmt.Println("Session azzza: ", helpers.ConvertToJSON(session))

	client, err := c.ClientService.RegistrateClientWithHashedPassword(session.Phone, session.Name, session.HashedPassword)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.sendClientTokens(ctx, client)
}

func (c *clientController) GenerateClientChangePasswordSession(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.RegistrateClientInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	_, nextSessionTime, err := c.ClientService.GenerateClientChangePasswordSession(input.Phone)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{
		"next_session_time": helpers.ConvertToStandardApiTime(nextSessionTime),
	}, h.AUTOMATIC_STATUS_CODE)
}

func (c *clientController) CheckPhoneValidationNumber(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.CheckPhoneValidationNumberInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	session, err := c.ClientService.CheckPhoneValidationNumberCorrectnessWithNewCodeGeneration(input.Phone, input.Number)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{
		"new_code": session.Number,
	}, h.AUTOMATIC_STATUS_CODE)
}

func (c *clientController) ChangePasswordBySessionNumber(ctx *fiber.Ctx) error {
	input, validationErrors, err := input.ParseRequestBody[entities.ChangePasswordBySessionNumberInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	fmt.Println("changin only in db number: ", input.Number)

	_, err = c.ClientService.CheckPhoneValidationNumberOnlyInDB(input.Phone, input.Number)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	client, err := c.ClientService.ChangePassword(input.Phone, input.Password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.sendClientTokens(ctx, client)
}

func (c *clientController) sendClientTokens(ctx *fiber.Ctx, client models.Client) error {
	accessToken, err := c.JwtService.GetAccessTokenString(
		int(client.ID),
		models.CLIENT_SIGNIFICANCE,
		models.CLIENT_ROLE_NAME,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		fmt.Println("error: ", err)
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	refreshToken, err := c.JwtService.GetRefreshTokenString(
		int(client.ID),
		models.CLIENT_SIGNIFICANCE,
		models.CLIENT_ROLE_NAME,
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
