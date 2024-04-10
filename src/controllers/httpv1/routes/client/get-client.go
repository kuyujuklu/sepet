package client

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/gofiber/fiber/v2"
)

type GetClientOutput struct {
	Ok     bool                  `json:"ok" example:"true"`
	Error  string                `json:"err" example:"invalid validation number"`
	Client entities.ClientOutput `json:"client"`
}

// @Summary      Get client info
// @Description  return client info
// @Tags         client
// @Produce      json
// @Success      200  {object}  GetClientOutput
// @Router       /client [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetClient(ctx *fiber.Ctx) error {
	userID, _, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	client, err := c.ClientService.GetClientByID(userID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.ClientOutput{}
	output.FillFromModel(client)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"client": output,
		},
		fiber.StatusOK)
}
