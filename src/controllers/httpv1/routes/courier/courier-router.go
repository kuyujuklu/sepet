package courier

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
	"github.com/gofiber/fiber/v2"
)

type courierController struct {
	CourierService courierservice.CourierService
}

func New() *courierController {
	return &courierController{
		CourierService: courierservice.New(),
	}
}

func (c *courierController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/:courierID<int>", c.GetCourierByID)
}

func (c *courierController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetCourierByToken)
	router.Post("/", c.CreateCourier)
	router.Put("/:courierID<int>", c.UpdateCourier)
	router.Post("/:courierID/image", c.UploadCourierImage)
	router.Post("/:courierID/reserve-order", c.ReserveOrder)
	router.Post("/:courierID/set-order-to-completed", c.SetOrderStatusToCompleted)
	router.Post("/:courierID/set-order-to-canceled", c.SetOrderStatusToCanceled)

}
