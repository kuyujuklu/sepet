package client

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

// @Summary      Mark a push campaign as opened by the current client
// @Description  Called by the app when a push notification is tapped - drives the "opened" column in the superadmin's send history
// @Tags         client
// @Produce      json
// @Param        campaignID path int true "push campaign id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /client/push-campaigns/{campaignID}/opened [POST]
func (c *clientController) MarkPushCampaignOpened(ctx *fiber.Ctx) error {
	userID, _, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if userRole != models.CLIENT_ROLE_NAME {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	campaignID, err := strconv.Atoi(ctx.Params("campaignID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	if err := c.PushCampaignService.MarkOpened(campaignID, userID); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}
