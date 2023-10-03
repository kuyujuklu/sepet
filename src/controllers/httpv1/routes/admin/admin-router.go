package admin

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type adminController struct {
	PubService pubservice.PubService
}

func New() *adminController {
	return &adminController{
		PubService: pubservice.New(),
	}
}

func (c *adminController) Router(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Use(middleware.AdminAuthMW)
	router.Post("/pubs/:pubID<int>/update-expiration-time", c.UpdatePubExpirationTime)
}
