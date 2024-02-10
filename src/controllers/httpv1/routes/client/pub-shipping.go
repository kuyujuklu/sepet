package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetShippingShapes struct {
	Ok        bool           `json:"ok" example:"true"`
	Available bool           `json:"available"`
	Shapes    []models.Shape `json:"shapes"`
}

// @Summary      Get shipping shapes
// @Description  Gets shipping shapes
// @Tags         client
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetShippingShapes
// @Router       /client/pub/{pubID}/shipping [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetShapesForPub(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("here")
	shapes, err := c.PubService.GetShapes(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("here")
	shipping, err := c.PubService.GetShipping(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"available": shipping.Available,
			"shapes":    shapes,
		},
		fiber.StatusOK)
}
