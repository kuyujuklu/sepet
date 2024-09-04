package courier

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/couriererrors"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type GetCourierByToken struct {
	Ok      bool                   `json:"ok" example:"true"`
	Courier entities.CourierOutput `json:"courier"`
}

// @Summary      Get courier info
// @Description  returns courier info
// @Tags         courier
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetCourierByToken
// @Router       /courier [get]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) GetCourierByToken(ctx *fiber.Ctx) error {
	userID, _, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if userRole != models.COURIER_ROLE_NAME {
		return h.SendError(ctx, couriererrors.ErrCourierNotFound, h.AUTOMATIC_STATUS_CODE)
	}

	courier, err := c.CourierService.GetCourierByID(userID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CourierOutput{}
	output.FillFromModel(courier)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"courier": output,
		},
		fiber.StatusOK)
}

// @Summary      Get courier info by id
// @Description  returns courier info by id
// @Tags         courier
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetCourierByToken
// @Router       /courier [get]

func (c *courierController) GetCourierByID(ctx *fiber.Ctx) error {

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	courier, err := c.CourierService.GetCourierByID(courierID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.CourierOutput{}
	output.FillFromModel(courier)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"courier": output,
		},
		fiber.StatusOK)
}
