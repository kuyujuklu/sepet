package pubs

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type pubController struct {
	PubService     pubservice.PubService
	CompanyService companyservice.CompanyService
}

func New() *pubController {
	return &pubController{
		PubService:     pubservice.New(),
		CompanyService: companyservice.New(),
	}
}

func (c *pubController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/:pubID<int>/logo", c.GetPubLogo)
	router.Get("/:pubID<int>/bg", c.GetPubBG)
}
func (c *pubController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllPubs)
	router.Post("/", c.CreatePub)
	router.Get("/:pubID<int>", c.GetPubByID)
	router.Put("/:pubID<int>", c.UpdatePub)
	router.Delete("/:pubID<int>/", c.DeletePub)
	router.Patch("/:pubID<int>/logo", c.UploadPubLogo)
	router.Patch("/:pubID<int>/bg", c.UploadPubBG)
}
