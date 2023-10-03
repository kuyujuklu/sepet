package admin

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/gofiber/fiber/v2"
)

type updatePubExpirationTimeOutput struct {
	Ok  bool               `json:"ok" example:"true"`
	Pub entities.PubOutput `json:"pub"`
}

// @Summary      Update pub expiration time
// @Description  Updates pub expiration
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body  true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /company/{companyID}/pubs/{pubID}/expiration-time [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) UpdatePubExpirationTime(ctx *fiber.Ctx) error {
	_, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.UpdateExpirationTimeInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	time, err := c.PubService.ExtendSubscription(pubID, input.Days)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"expiration_time_utc": helpers.ConvertToStandardApiTime(time),
		},
		fiber.StatusOK)
}
