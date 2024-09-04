package courier

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type CreateCourierOutput struct {
	Ok bool `json:"ok" example:"true"`
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
func (c *courierController) CreateCourier(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if userSignificance > models.ADMIN_SIGNIFICANCE {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.CreateCourierInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	courier, err := c.CourierService.CreateCourier(input.Email, input.Password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"id":    courier.ID,
			"email": courier.Email,
		},
		fiber.StatusCreated)
}
