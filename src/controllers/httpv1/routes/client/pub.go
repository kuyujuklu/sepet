package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetPubInfoOutput struct {
	Ok         bool                      `json:"ok" example:"true"`
	PubInfo    entities.PubOutput        `json:"pub"`
	Menus      []entities.MenuOutput     `json:"menus"`
	Categories []entities.CategoryOutput `json:"categories"`
	Dishes     []entities.DishOutput     `json:"dishes"`
}

// @Summary      Get all pub info
// @Description  return all pub info includes menus categories and dishes
// @Tags         client
// @Param url_name path int true "pub url name"
// @Produce      json
// @Success      200  {object}  GetPubInfoOutput
// @Router       /client/pub/{url_name} [get]
func (c *clientController) GetPubInfoByUrlName(ctx *fiber.Ctx) error {
	pubName := ctx.Params("pubName")
	if pubName == "" {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pub, err := c.PubService.GetPubByUrlName(pubName)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.getPubInfo(ctx, pub)
}

// @Summary      Get all pub info
// @Description  return all pub info includes menus categories and dishes
// @Tags         client
// @Param id path int true "pub id"
// @Produce      json
// @Success      200  {object}  GetPubInfoOutput
// @Router       /client/pub/{id} [get]
func (c *clientController) GetPubInfoByID(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pub, err := c.PubService.GetPubById(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return c.getPubInfo(ctx, pub)
}

func (c *clientController) getPubInfo(ctx *fiber.Ctx, pub models.Pub) error {
	menus, err := c.PubService.GetAllMenusForPub(int(pub.ID))
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	categories, err := c.PubService.GetAllCategoriesForPub(int(pub.ID))
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	dishes, err := c.PubService.GetAllDishesForPub(int(pub.ID))
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	pubOutput := entities.PubOutput{}
	err = pubOutput.FillFromModel(pub)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	menusOutput := make([]entities.MenuOutput, 0, len(menus))
	for _, menu := range menus {
		menuOutput := entities.MenuOutput{}
		menuOutput.FillFromModel(menu)
		menusOutput = append(menusOutput, menuOutput)
	}

	categoriesOutput := make([]entities.CategoryOutput, 0, len(categories))
	for _, category := range categories {
		categoryOutput := entities.CategoryOutput{}
		categoryOutput.FillFromModel(category)
		categoriesOutput = append(categoriesOutput, categoryOutput)
	}

	dishesOutput := make([]entities.DishOutput, 0, len(dishes))
	for _, dish := range dishes {
		dishOutput := entities.DishOutput{}
		dishOutput.FillFromModel(dish)
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

type GetPubPreorderOutput struct {
	Ok           bool `json:"ok" example:"true"`
	CardPreorder bool `json:"card_preorder"`
	CashPreorder bool `json:"cash_preorder"`
}

// @Summary      Get preorder
// @Description  Gets  preorder info
// @Tags         client
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetPubPreorderOutput
// @Router       /company/{companyID}/pubs/{pubID}/preorder [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetPubPreorder(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	preorder, err := c.PubService.GetPreorderInfo(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("Preorder: ", preorder)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok":            true,
			"card_preorder": preorder.CardPreorder,
			"cash_preorder": preorder.CashPreorder,
		},
		fiber.StatusOK)
}

type GetShippingShapes struct {
	Ok        bool           `json:"ok" example:"true"`
	Available bool           `json:"available"`
	Shapes    []models.Shape `json:"shapes"`
}

// @Summary      Get shipping shapes
// @Description  Gets shipping shapes
// @Tags         client
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetShippingShapes
// @Router       /client/pub/{pubID}/shipping [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *clientController) GetShapesForPub(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("here")
	shapes, err := c.PubService.GetShapes(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	fmt.Println("here")
	shipping, err := c.PubService.GetShipping(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"available": shipping.Available,
			"shapes":    shapes,
		},
		fiber.StatusOK)
}
