package ws

import (
	"github.com/alexkalak/qrmenu/src/controllers/ws/courierws"
	"github.com/alexkalak/qrmenu/src/controllers/ws/orders"
	"github.com/gofiber/fiber/v2"
)

func Router(router fiber.Router) {
	ordersRouter := orders.New()
	courierOrdersRouter := courierws.New()
	router.Route("/orders", ordersRouter.AuthorizedRouter)
	router.Route("/courier", courierOrdersRouter.AuthorizedRouter)
}
