package pubs

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type SetLatLngResponse struct {
	Ok  bool    `json:"ok" example:"true"`
	Err string  `json:"err" example:""`
	Lat float64 `json:"lat" example:"55.7558"`
	Lng float64 `json:"lng" example:"37.6176"`
}

// @Summary      Set lat lng
// @Description  sets lat lng for pub
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetLatLngInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetLatLngResponse
// @Router       /company/{companyID}/pubs/{pubID}/geolocation [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetPubGeolocation(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetLatLngInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetLatLng(pubID, input.Lat, input.Lng)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"lat": input.Lat,
			"lng": input.Lng,
		},
		fiber.StatusOK)
}

func (c *pubController) GetPubGeolocation(ctx *fiber.Ctx) error {
	fmt.Println("helllllloooooooooo")
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	pub, err := c.PubService.GetPubById(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"lat": pub.Lat,
			"lng": pub.Lng,
		},
		fiber.StatusOK)
}
