package admin

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type SubscriberStatsOutput struct {
	Ok               bool `json:"ok" example:"true"`
	LinkedCount      int  `json:"linked_count"`
	AnonymousCount   int  `json:"anonymous_count"`
	TotalSubscribers int  `json:"total_subscribers"`
}

// @Summary      Live push subscriber counts
// @Description  linked = a real client behind the subscription; anonymous = a
// @Description  device that granted notification permission but hasn't logged in yet
// @Tags         admin
// @Produce      json
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/push-campaigns/subscriber-stats [GET]
func (c *adminController) GetSubscriberStats(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	linked, anonymous, err := c.NotificationService.GetSubscriberStats()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{
		"linked_count":      linked,
		"anonymous_count":   anonymous,
		"total_subscribers": linked + anonymous,
	}, fiber.StatusOK)
}
