package orders

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type ordersController struct {
	JwtService   jwtservice.JwtService
	PubService   pubservice.PubService
	OrderService orderservice.OrderService
}

func New() *ordersController {
	return &ordersController{
		JwtService:   jwtservice.New(),
		PubService:   pubservice.New(),
		OrderService: orderservice.New(),
	}
}

func (c *ordersController) UnauthorizedRouter(router fiber.Router) {
	router.Post("/", c.CreateOrder)
}

func (c *ordersController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllOrdersForPub)
	router.Put("/:orderID<int>/update-status", c.UpdateOrderStatus)
	router.Put("/:orderID<int>/update-delivery-price", c.UpdateOrderDeliveryPrice)
	router.Put("/:orderID<int>/update-dishes", c.UpdateOrderDishes)
}
