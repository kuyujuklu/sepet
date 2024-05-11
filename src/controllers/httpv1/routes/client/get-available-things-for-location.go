package client

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetAvailablePubsOutput struct {
	Ok   bool                 `json:"ok" example:"true"`
	Pubs []entities.PubOutput `json:"pubs"`
	Err  string               `json:"err"`
}

// @Summary      Get available pubs info
// @Description  returns pubs available pubs info
// @Tags         client
// @Produce      json
// @Success      200  {object}  GetAvailablePubsOutput
// @Router       /client/get-available-pubs [GET]
func (c *clientController) GetAvailableForShippingPubs(ctx *fiber.Ctx) error {
	lat, err := strconv.ParseFloat(ctx.Query("lat"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLatitude, h.AUTOMATIC_STATUS_CODE)
	}

	lng, err := strconv.ParseFloat(ctx.Query("lng"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLongitude, h.AUTOMATIC_STATUS_CODE)
	}

	pubs, err := c.PubService.GetPubsWithShippingAvailableForPoint(models.Vertex{Lat: lat, Lng: lng})
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	distances, err := c.GoogleMapsService.GetDistanceToPubs(ctx.Context(), lat, lng, pubs)

	if len(distances) != len(pubs) {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	outputPubs := make([]entities.PubWithDishesAndDistanceOutput, 0, len(pubs))

	for i, pub := range pubs {
		dishes, err := c.PubService.GetAllDishesForPub(int(pub.ID))
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}
		outputPub := entities.PubWithDishesAndDistanceOutput{}
		if err := outputPub.FillFromModel(pub, distances[i], dishes); err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}

		outputPubs = append(outputPubs, outputPub)
	}

	fmt.Println("pubs len: ", len(pubs))

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"pubs": outputPubs,
		},
		fiber.StatusOK)
}

type GetCategoriesOutput struct {
	Ok         bool                      `json:"ok" example:"true"`
	Categories []entities.CategoryOutput `json:"categories"`
	Err        string                    `json:"err"`
}

// @Summary      Get available categories for shipping
// @Description  returns available categories from pubs available for shipping
// @Tags         client
// @Produce      json
// @Success      200  {object}  GetCategoriesOutput
// @Router       /client/get-available-categories [GET]
func (c *clientController) GetAvailableForShippingPubCategories(ctx *fiber.Ctx) error {
	lat, err := strconv.ParseFloat(ctx.Query("lat"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLatitude, h.AUTOMATIC_STATUS_CODE)
	}

	lng, err := strconv.ParseFloat(ctx.Query("lng"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLongitude, h.AUTOMATIC_STATUS_CODE)
	}

	pubs, err := c.PubService.GetPubsWithShippingAvailableForPoint(models.Vertex{Lat: lat, Lng: lng})
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(pubs) == 0 {
		return h.SendSuccess(
			ctx,
			fiber.Map{
				"categories": []models.Category{},
			},
			fiber.StatusOK)
	}

	categories, err := c.PubService.GetCategoriesWithPreloadedMenuForPubs(pubs)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	outputCategories := make([]entities.CategoryOutputWithPubID, 0, len(categories))

	for _, category := range categories {
		outputCategory := entities.CategoryOutputWithPubID{}
		err := outputCategory.FillFromModel(category)
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}
		outputCategories = append(outputCategories, outputCategory)
	}

	fmt.Println("categories len: ", len(outputCategories))

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"categories": outputCategories,
		},
		fiber.StatusOK)
}
