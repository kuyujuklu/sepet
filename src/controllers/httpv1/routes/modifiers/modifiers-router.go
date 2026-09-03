package modifiers

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/repo/modifiergrouprepo"
	"github.com/gofiber/fiber/v2"
)

type modifiersController struct {
	ModifierGroupRepo modifiergrouprepo.ModifierGroupRepo
}

func New() *modifiersController {
	return &modifiersController{
		ModifierGroupRepo: modifiergrouprepo.New(),
	}
}

func (c *modifiersController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllModifierGroups)
	router.Post("/", c.CreateModifierGroup)
	router.Put("/:groupID<int>", c.UpdateModifierGroup)
	router.Delete("/:groupID<int>", c.DeleteModifierGroup)
}
