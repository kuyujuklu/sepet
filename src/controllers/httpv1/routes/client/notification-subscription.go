package client

import (
	"errors"
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

type NotificationSubscribeResponse struct {
	Ok    bool   `json:"ok" example:"true"`
	Error string `json:"err" example:"client not found"`
}

// @Summary      Subscribe to expo notifications
// @Description  return ok if subscription was successfull
// @Tags         Notification
// @Param input body entities.RegistrateClientInput true "registratio input"
// @Produce      json
// @Success      200  {object}  NotificationSubscribeResponse
// @Router       /api/client/notifications/subscribe [POST]
func (c *clientController) SubscribeToNotification(ctx *fiber.Ctx) error {
	fmt.Println("HELLO")
	input, validationErrors, err := input.ParseRequestBody[entities.NotificationSubscriptionInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	fmt.Println("INPUT IN NOTIFICATION SUBSCRIBE: ", input)

	// The app sends whatever registerForPushNotificationsAsync resolved to,
	// including - on a client bug now fixed - the stringified error itself
	// when getting a real token failed (permission denied, FCM
	// TOO_MANY_REGISTRATIONS, ...). Those aren't rare typos, they're exactly
	// what the client sends for every device that never got a real token, so
	// storing them here means every future push send/campaign tries to
	// deliver to them and fails at Expo. Same shape check Expo's own SDK
	// uses when actually sending (NewExponentPushToken).
	if _, err := expo.NewExponentPushToken(input.Token); err != nil {
		return h.SendError(ctx, errors.New("invalid expo push token"), h.AUTOMATIC_STATUS_CODE)
	}

	if input.Lang != models.NOTIFICATION_LANG_RO {
		input.Lang = models.NOTIFICATION_LANG_RU
	}

	notificationSub, err := c.NotificationSevice.Subscribe(input.Phone, input.Token, input.Lang)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{
		"token": notificationSub.ExpoNotificationToken,
	}, h.AUTOMATIC_STATUS_CODE)

}
