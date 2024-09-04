package courier

import (
	"fmt"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type UpdateCourierOutput struct {
	Ok      bool                   `json:"ok" example:"true"`
	Courier entities.CourierOutput `json:"courier"`
}

// @Summary      Create courier
// @Description  Creates new courier account
// @Tags         courier
// @Param input body entities.CreateCourierInput true "courier email and password"
// @Accept       json
// @Produce      json
// @Success      201  {object}  CreateCourierOutput
// @Router       /courier [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) UpdateCourier(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.UpdateCourierInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	courier, err := input.ConvertToModel()
	if err != nil {
		fmt.Println("convert to modle error")
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	courier, err = c.CourierService.UpdateCourier(userID, courier)
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
		fiber.StatusCreated)
}
