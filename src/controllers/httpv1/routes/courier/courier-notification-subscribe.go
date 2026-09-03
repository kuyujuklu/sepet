package courier

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type SubscribeToNotificationsOutput struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Subscribe courier to push notifications
// @Description  Subscribes the courier's device to Expo push notifications for new orders
// @Tags         courier
// @Param courierID path int true "courier id"
// @Param input body entities.CourierNotificationSubscriptionInput true "expo push token"
// @Accept       json
// @Produce      json
// @Success      200  {object}  SubscribeToNotificationsOutput
// @Router       /courier/{courierID}/notifications/subscribe [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) SubscribeToNotifications(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.CourierNotificationSubscriptionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	if input.Lang != models.NOTIFICATION_LANG_RO {
		input.Lang = models.NOTIFICATION_LANG_RU
	}

	err = c.CourierService.SubscribeToNotifications(courierID, input.Token, input.Lang)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{"ok": true}, h.AUTOMATIC_STATUS_CODE)
}
