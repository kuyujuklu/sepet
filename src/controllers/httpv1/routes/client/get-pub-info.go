package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type getPubInfoOutput struct {
	Ok         bool                      `json:"ok" example:"true"`
	PubInfo    entities.PubOutput        `json:"pub"`
	Menus      []entities.MenuOutput     `json:"menus"`
	Categories []entities.CategoryOutput `json:"categories"`
	Dishes     []entities.DishOutput     `json:"dishes"`
}

// @Summary      Get all pub info
// @Description  return all pub info includes menus categories and dishes
// @Tags         client
// @Param id path int true "pub id"
// @Produce      json
// @Success      200  {object}  getPubInfoOutput
// @Router       /client/pub/{id} [get]
func (c *clientController) GetPubInfo(ctx *fiber.Ctx) error {
	fmt.Println("got query in get pub on client router")
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pub, err := c.PubService.GetPubById(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	menus, err := c.PubService.GetAllMenusForPub(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	categories, err := c.PubService.GetAllCategoriesForPub(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	dishes, err := c.PubService.GetAllDishesForPub(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	pubOutput := entities.PubOutput{}
	pubOutput.ConvertFromModel(pub)

	menusOutput := make([]entities.MenuOutput, 0, len(menus))
	for _, menu := range menus {
		menuOutput := entities.MenuOutput{}
		menuOutput.ConvertFromModel(menu)
		menusOutput = append(menusOutput, menuOutput)
	}

	categoriesOutput := make([]entities.CategoryOutput, 0, len(categories))
	for _, category := range categories {
		categoryOutput := entities.CategoryOutput{}
		categoryOutput.ConvertFromModel(category)
		categoriesOutput = append(categoriesOutput, categoryOutput)
	}

	dishesOutput := make([]entities.DishOutput, 0, len(dishes))
	for _, dish := range dishes {
		dishOutput := entities.DishOutput{}
		dishOutput.ConvertFromModel(dish)
		dishesOutput = append(dishesOutput, dishOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"pub":        pubOutput,
			"menus":      menusOutput,
			"categories": categoriesOutput,
			"dishes":     dishesOutput,
		},
		fiber.StatusOK)
}
