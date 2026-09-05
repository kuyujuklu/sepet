package client

import (
	"os"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/clientservice"
	"github.com/alexkalak/qrmenu/src/services/dishesservice"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/alexkalak/qrmenu/src/services/notificationservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/alexkalak/qrmenu/src/services/osrmservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/alexkalak/qrmenu/src/services/pushcampaignservice"
	"github.com/alexkalak/qrmenu/src/services/roleservice"
	"github.com/gofiber/fiber/v2"
)

type clientController struct {
	JwtService                        jwtservice.JwtService
	PubService                        pubservice.PubService
	MenuService                       menuservice.MenuService
	CategoryService                   categoryservice.CategoryService
	DishService                       dishesservice.DishesService
	ClientService                     clientservice.ClientService
	NotificationSevice                notificationservice.NotificationService
	RoleService                       roleservice.RoleService
	OrderService                      orderservice.OrderService
	DistanceService                   osrmservice.OsrmService
	PushCampaignService               pushcampaignservice.PushCampaignService
	ClientApplicationNewestVersion    string
	ClientApplicationMinActiveVersion string
}

func New() *clientController {
	return &clientController{
		JwtService:                        jwtservice.New(),
		PubService:                        pubservice.New(),
		MenuService:                       menuservice.New(),
		CategoryService:                   categoryservice.New(),
		DishService:                       dishesservice.New(),
		ClientService:                     clientservice.New(),
		RoleService:                       roleservice.New(),
		OrderService:                      orderservice.New(),
		DistanceService:                   osrmservice.New(),
		NotificationSevice:                notificationservice.New(),
		PushCampaignService:               pushcampaignservice.New(),
		ClientApplicationMinActiveVersion: os.Getenv("APPLICATION_MIN_ACTIVE_VERSION"),
		ClientApplicationNewestVersion:    os.Getenv("APPLICATION_NEWEST_VERSION"),
	}
}

func (c *clientController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/pub/:pubName<string>", c.GetPubInfoByUrlName)
	router.Get("/pub/id/:pubID<int>", c.GetPubInfoByID)
	router.Get("/pub/:pubID<int>/shipping", c.GetShapesForPub)
	router.Get("/pub/:pubID<int>/preorder", c.GetPubPreorder)
	router.Post("/registration", c.RegistrateClient)
	router.Post("/delete-client", c.DeleteClient)
	router.Get("/app-version-info", c.GetAppVersion)

	router.Post("/auth/check-validation-number", c.CheckPhoneValidationNumber)
	router.Post("/registration/generate-phone-validation-session", c.GenerateClientRegistrationSession)
	router.Post("/registration/registrate-by-session-number", c.RegistrateBySessionNumber)
	router.Post("/auth/generate-change-password-validation-session", c.GenerateClientChangePasswordSession)
	router.Post("/auth/change-password-with-validation-number", c.ChangePasswordBySessionNumber)

	router.Post("/authentication", c.AuthenticateClient)
	router.Post("/authentication/refresh-token", c.RefreshToken)
	router.Post("/notifications/subscribe", c.SubscribeToNotification)
	router.Get("/get-available-pubs", c.GetAvailableForShippingPubs)
	router.Get("/get-available-categories", c.GetAvailableForShippingPubCategories)
	router.Get("/get-available-top-dishes", c.GetAvailableTopDishes)
}

func (c *clientController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetClient)

	// Orders
	router.Post("/delete-client-by-token", c.DeleteClientByToken)
	router.Post("/orders", c.CreateOrder)
	router.Post("/orders/:orderID<int>/rate", c.RateOrder)
	router.Get("/orders", c.GetAllOrdersForClient)

	router.Post("/push-campaigns/:campaignID<int>/opened", c.MarkPushCampaignOpened)
	router.Post("/notifications/:deliveryID<int>/received", c.MarkNotificationReceived)
	router.Post("/notifications/:deliveryID<int>/opened", c.MarkNotificationOpened)
}
