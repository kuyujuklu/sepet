package admin

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

// @Summary      List shipping copy presets
// @Description  Saved donor/target configurations for the admin shipping copy tool
// @Tags         admin
// @Produce      json
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/shipping-copy-presets [GET]
func (c *adminController) GetAllShippingCopyPresets(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	presets, err := c.ShippingCopyPresetService.GetAll()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	presetsOutput := make([]entities.ShippingCopyPresetOutput, 0, len(presets))
	for _, preset := range presets {
		presetOutput := entities.ShippingCopyPresetOutput{}
		if err := presetOutput.FillFromModel(preset); err != nil {
			continue
		}
		presetsOutput = append(presetsOutput, presetOutput)
	}

	return h.SendSuccess(ctx, fiber.Map{"presets": presetsOutput}, fiber.StatusOK)
}

// @Summary      Create a shipping copy preset
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input body entities.ShippingCopyPresetInput true "preset params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/shipping-copy-presets [POST]
func (c *adminController) CreateShippingCopyPreset(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	presetInput, validationErrors, err := input.ParseRequestBody[entities.ShippingCopyPresetInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	preset, err := presetInput.ConvertToModel()
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	created, err := c.ShippingCopyPresetService.Create(preset)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	presetOutput := entities.ShippingCopyPresetOutput{}
	if err := presetOutput.FillFromModel(created); err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{"preset": presetOutput}, fiber.StatusOK)
}

// @Summary      Update a shipping copy preset
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        presetID path int true "preset id"
// @Param        input body entities.ShippingCopyPresetInput true "preset params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/shipping-copy-presets/{presetID} [PUT]
func (c *adminController) UpdateShippingCopyPreset(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	presetID, err := strconv.Atoi(ctx.Params("presetID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	presetInput, validationErrors, err := input.ParseRequestBody[entities.ShippingCopyPresetInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	preset, err := presetInput.ConvertToModel()
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	updated, err := c.ShippingCopyPresetService.Update(presetID, preset)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	presetOutput := entities.ShippingCopyPresetOutput{}
	if err := presetOutput.FillFromModel(updated); err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{"preset": presetOutput}, fiber.StatusOK)
}

// @Summary      Mark a shipping copy preset as just applied
// @Tags         admin
// @Produce      json
// @Param        presetID path int true "preset id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/shipping-copy-presets/{presetID}/mark-applied [POST]
func (c *adminController) MarkShippingCopyPresetApplied(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	presetID, err := strconv.Atoi(ctx.Params("presetID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	updated, err := c.ShippingCopyPresetService.TouchLastApplied(presetID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	presetOutput := entities.ShippingCopyPresetOutput{}
	if err := presetOutput.FillFromModel(updated); err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{"preset": presetOutput}, fiber.StatusOK)
}

// @Summary      Delete a shipping copy preset
// @Tags         admin
// @Produce      json
// @Param        presetID path int true "preset id"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/shipping-copy-presets/{presetID} [DELETE]
func (c *adminController) DeleteShippingCopyPreset(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	presetID, err := strconv.Atoi(ctx.Params("presetID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	if err := c.ShippingCopyPresetService.Delete(presetID); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}
