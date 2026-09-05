package client

import (
	"errors"
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

	return c.getPubInfoRespectingCoords(ctx, pub)
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

	return c.getPubInfoRespectingCoords(ctx, pub)
}

// getPubInfoRespectingCoords is the shared body of both pub-info routes: with
// a real lat/lng it answers with the point-computed shipping_price/
// shipping_free_delivery_price (getPubInfoWithShippingPricesForPoint),
// otherwise the plain pub-level shipping config (getPubInfo). Before this was
// pulled out, GetPubInfoByID never even looked at ctx.Query("lat"/"lng") and
// always took the plain path - the basket/checkout screens fetch pub info by
// ID, so shipping_price came back as a bare Go zero-value on every request,
// which the client reads as `+undefined || 0` and shows as free delivery
// regardless of the real zone price.
func (c *clientController) getPubInfoRespectingCoords(ctx *fiber.Ctx, pub models.Pub) error {
	lat := ctx.Query("lat")
	lng := ctx.Query("lng")

	if lat != "" && lat != "0" && lng != "" && lng != "0" {
		latFloat, err := strconv.ParseFloat(lat, 32)
		if err != nil {
			return h.SendError(ctx, errors.New("invalid lat"), h.AUTOMATIC_STATUS_CODE)
		}
		lngFloat, err := strconv.ParseFloat(lng, 32)
		if err != nil {
			return h.SendError(ctx, errors.New("invalid lng"), h.AUTOMATIC_STATUS_CODE)
		}

		return c.getPubInfoWithShippingPricesForPoint(ctx, pub, models.Vertex{Lat: latFloat, Lng: lngFloat})
	}

	return c.getPubInfo(ctx, pub)
}

func (c *clientController) getPubInfo(ctx *fiber.Ctx, pub models.Pub) error {
	pubOutput, menusOutput, categoriesOutput, dishesOutput, err := c.getPubMenusCategoriesDishesOutput(pub)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
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

func (c *clientController) getPubInfoWithShippingPricesForPoint(ctx *fiber.Ctx, pub models.Pub, point models.Vertex) error {
	_, menusOutput, categoriesOutput, dishesOutput, err := c.getPubMenusCategoriesDishesOutput(pub)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAvailable, shippingPrice, freeDeliveryPrice, err := c.PubService.GetShippingPricesForPubAvailableForPoint(pub, point)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	pubOutput := entities.PubWithDishesAndDistanceOutput{}
	pubOutput.FillFromModel(pub, 0, []models.Dish{})
	pubOutput.ShippingPrice = shippingPrice
	pubOutput.ShippingFreeDeliveryPrice = freeDeliveryPrice
	pubOutput.PubOutput.ShippingOutput.Available = isAvailable

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

func (c *clientController) getPubMenusCategoriesDishesOutput(pub models.Pub) (entities.PubOutput, []entities.MenuOutput, []entities.CategoryOutput, []entities.DishOutput, error) {
	menus, err := c.PubService.GetAllMenusForPub(int(pub.ID))
	if err != nil {
		return entities.PubOutput{}, nil, nil, nil, err
	}

	categories, err := c.PubService.GetAllCategoriesForPub(int(pub.ID))
	if err != nil {
		return entities.PubOutput{}, nil, nil, nil, err
	}

	dishes, err := c.PubService.GetAllDishesForPub(int(pub.ID))
	if err != nil {
		return entities.PubOutput{}, nil, nil, nil, err
	}

	pubOutput := entities.PubOutput{}
	err = pubOutput.FillFromModel(pub)
	if err != nil {
		return entities.PubOutput{}, nil, nil, nil, err
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

	return pubOutput, menusOutput, categoriesOutput, dishesOutput, nil
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

	shipping, err := c.PubService.GetShipping(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	shippingOutput := entities.ShippingOutput{}
	shippingOutput.FillFromModel(shipping)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"id":                            shippingOutput.ID,
			"available":                     shippingOutput.Available,
			"shipping_time_from":            shippingOutput.ShippingTimeFrom,
			"shipping_time_to":              shippingOutput.ShippingTimeTo,
			"shipping_work_start":           shippingOutput.ShippingStartWorkTime,
			"shipping_work_end":             shippingOutput.ShippingEndWorkTime,
			"shipping_work_hours_for_week":  shippingOutput.ShippingWorkHoursForWeek,
			"shipping_prices":               shippingOutput.ShippingPrices,
			"shipping_free_delivery_prices": shippingOutput.ShippingFreeDeliveryPrices,
			"shapes":                        shippingOutput.Shapes,
		},
		fiber.StatusOK)
}
