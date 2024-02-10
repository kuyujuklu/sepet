package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type GetPubPreorder struct {
	Ok           bool `json:"ok" example:"true"`
	CardPreorder bool `json:"card_preorder"`
	CashPreorder bool `json:"cash_preorder"`
}

// @Summary      Get preorder
// @Description  Gets  preorder info
// @Tags         client
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  SetShippingShapes
// @Router       /company/{companyID}/pubs/{pubID}/preorder [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetPubPreorder(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	preorder, err := c.PubService.GetPreorderInfo(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("Preorder: ", preorder)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok":            true,
			"card_preorder": preorder.CardPreorder,
			"cash_preorder": preorder.CashPreorder,
		},
		fiber.StatusOK)
}
