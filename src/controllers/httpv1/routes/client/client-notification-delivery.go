package client

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

// @Summary      Mark a push notification as received by the current client
// @Description  Called by the app's notification-received listener - covers both
// @Description  campaign pushes and individual order/status ones, addressed by the
// @Description  recipient row id carried in the push's own Data (see PushCampaignRecipient)
// @Tags         Notification
// @Param        deliveryID path int true "push recipient id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /client/notifications/{deliveryID}/received [POST]
func (c *clientController) MarkNotificationReceived(ctx *fiber.Ctx) error {
	userID, _, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if userRole != models.CLIENT_ROLE_NAME {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	deliveryID, err := strconv.Atoi(ctx.Params("deliveryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	if err := c.PushCampaignService.MarkReceivedByRecipient(deliveryID, userID); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}

// @Summary      Mark a push notification as opened by the current client
// @Description  Same addressing as .../received - the generic counterpart to
// @Description  /push-campaigns/{campaignID}/opened for pushes with a recipient id
// @Description  in their Data (individual notifications, and campaigns sent since
// @Description  this endpoint was added)
// @Tags         Notification
// @Param        deliveryID path int true "push recipient id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /client/notifications/{deliveryID}/opened [POST]
func (c *clientController) MarkNotificationOpened(ctx *fiber.Ctx) error {
	userID, _, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if userRole != models.CLIENT_ROLE_NAME {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	deliveryID, err := strconv.Atoi(ctx.Params("deliveryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	if err := c.PushCampaignService.MarkOpenedByRecipient(deliveryID, userID); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}
