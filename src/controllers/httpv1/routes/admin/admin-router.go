package admin

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/clientservice"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
	"github.com/alexkalak/qrmenu/src/services/notificationservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/alexkalak/qrmenu/src/services/pushcampaignservice"
	"github.com/alexkalak/qrmenu/src/services/shippingcopypresetservice"
	"github.com/alexkalak/qrmenu/src/services/telegramservice"
	"github.com/gofiber/fiber/v2"
)

type adminController struct {
	PubService                pubservice.PubService
	CompanyService            companyservice.CompanyService
	CourierService            courierservice.CourierService
	OrderService              orderservice.OrderService
	ClientService             clientservice.ClientService
	NotificationService       notificationservice.NotificationService
	TelegramService           telegramservice.TelegramService
	ShippingCopyPresetService shippingcopypresetservice.ShippingCopyPresetService
	PushCampaignService       pushcampaignservice.PushCampaignService
}

func New() *adminController {
	tservice, err := telegramservice.New()
	if err != nil {
		tservice = nil
	}

	return &adminController{
		PubService:          pubservice.New(),
		CompanyService:      companyservice.New(),
		CourierService:      courierservice.New(),
		OrderService:        orderservice.New(),
		ClientService:       clientservice.New(),
		NotificationService: notificationservice.New(),

		TelegramService:           tservice,
		ShippingCopyPresetService: shippingcopypresetservice.New(),
		PushCampaignService:       pushcampaignservice.New(),
	}
}

func (c *adminController) Router(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Use(middleware.AdminAuthMW)
	router.Post("/pubs/:pubID<int>/update-expiration-time", c.UpdatePubExpirationTime)
	router.Post("/get-pub-refresh-token", c.GetPubRefreshToken)
	router.Post("/check-admin", c.CheckAdmin)
	router.Get("/pubs", c.GetAllPub)
	router.Get("/orders", c.GetAllOrders)
	router.Get("/clients", c.GetAllClients)
	router.Post("/send-notification-to-all-clients", c.SendNotificationToAllClients)
	router.Post("/send-notification-to-token", c.SendToToken)
	router.Post("/companies/:companyID<int>/update-tariff", c.UpdateCompanyTariff)

	router.Get("/couriers", c.GetAllCouriers)
	router.Post("/add-to-order-courier-debit/:orderID<int>", c.AddToOrderCourierDebit)
	router.Post("/add-to-courier-balance/:courierID<int>", c.AddToCourierBalance)
	router.Post("/create-telegram-super-user", c.CreateTelegramSuperUser)
	router.Post("/set-pubs-for-super-user", c.SetPubsForSuperUser)

	router.Get("/shipping-copy-presets", c.GetAllShippingCopyPresets)
	router.Post("/shipping-copy-presets", c.CreateShippingCopyPreset)
	router.Put("/shipping-copy-presets/:presetID<int>", c.UpdateShippingCopyPreset)
	router.Post("/shipping-copy-presets/:presetID<int>/mark-applied", c.MarkShippingCopyPresetApplied)
	router.Delete("/shipping-copy-presets/:presetID<int>", c.DeleteShippingCopyPreset)

	router.Get("/push-campaigns", c.GetAllPushCampaigns)
	router.Post("/push-campaigns", c.CreatePushCampaign)
	router.Get("/push-campaigns/audience-preview", c.PreviewPushCampaignAudience)
	router.Post("/push-campaigns/test-send", c.TestSendPushCampaign)
	router.Get("/push-campaigns/subscriber-stats", c.GetSubscriberStats)
}
