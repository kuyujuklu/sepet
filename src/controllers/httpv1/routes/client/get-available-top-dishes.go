package client

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/clienterrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetAvailableTopDishesOutput struct {
	Ok     bool                      `json:"ok" example:"true"`
	Dishes []entities.TopDishOutput  `json:"dishes"`
	Err    string                    `json:"err"`
}

// @Summary      Get top dishes for location
// @Description  cross-restaurant home feed: dishes from every pub delivering to lat/lng,
// @Description  ranked by order count ("top", default) or restricted to discounted dishes
// @Description  ("discount"), optionally section-filtered, paginated with limit/offset
// @Tags         client
// @Produce      json
// @Param        lat query number true "latitude"
// @Param        lng query number true "longitude"
// @Param        filter query string false "top | discount"
// @Param        section query string false "food | flowers | groceries"
// @Param        limit query int false "default 8"
// @Param        offset query int false "default 0"
// @Success      200  {object}  GetAvailableTopDishesOutput
// @Router       /client/get-available-top-dishes [GET]
func (c *clientController) GetAvailableTopDishes(ctx *fiber.Ctx) error {
	lat, err := strconv.ParseFloat(ctx.Query("lat"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLatitude, h.AUTOMATIC_STATUS_CODE)
	}

	lng, err := strconv.ParseFloat(ctx.Query("lng"), 64)
	if err != nil {
		return h.SendError(ctx, clienterrors.ErrInvalidLongitude, h.AUTOMATIC_STATUS_CODE)
	}

	filter := ctx.Query("filter")
	section := ctx.Query("section")

	limit, err := strconv.Atoi(ctx.Query("limit"))
	if err != nil || limit <= 0 {
		limit = 8
	}

	offset, err := strconv.Atoi(ctx.Query("offset"))
	if err != nil || offset < 0 {
		offset = 0
	}

	topDishes, err := c.PubService.GetAvailableTopDishes(models.Vertex{Lat: lat, Lng: lng}, section, filter, limit, offset)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.TopDishOutput, 0, len(topDishes))
	for _, topDish := range topDishes {
		dishOutput := entities.TopDishOutput{}
		dishOutput.FillFromModel(topDish.Dish, topDish.Pub, topDish.IsOpen)
		output = append(output, dishOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"dishes": output,
		},
		fiber.StatusOK)
}
