package modifiers

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

// @Summary      Get modifier groups
// @Description  all modifier groups for a pub (reusable across its dishes), with their options
// @Tags         ModifierGroup
// @Produce      json
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/modifier-groups [GET]
func (c *modifiersController) GetAllModifierGroups(ctx *fiber.Ctx) error {
	_, pubID, err := c.checkPubAccess(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	groups, err := c.ModifierGroupRepo.GetAllGroupsForPub(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := make([]entities.ModifierGroupOutput, 0, len(groups))
	for _, group := range groups {
		groupOutput := entities.ModifierGroupOutput{}
		groupOutput.FillFromModel(group)
		output = append(output, groupOutput)
	}

	return h.SendSuccess(ctx, fiber.Map{"modifier_groups": output}, fiber.StatusOK)
}

// @Summary      Create modifier group
// @Tags         ModifierGroup
// @Accept       json
// @Produce      json
// @Param input body entities.ModifierGroupInput true "modifier group params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/modifier-groups [POST]
func (c *modifiersController) CreateModifierGroup(ctx *fiber.Ctx) error {
	_, pubID, err := c.checkPubAccess(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	groupInput, validationErrors, err := input.ParseRequestBody[entities.ModifierGroupInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	group, err := c.ModifierGroupRepo.CreateGroup(pubID, groupInput.ConvertToModel())
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.ModifierGroupOutput{}
	output.FillFromModel(group)

	return h.SendSuccess(ctx, fiber.Map{"modifier_group": output}, fiber.StatusCreated)
}

// @Summary      Update modifier group
// @Description  replaces the group's name and its full option list
// @Tags         ModifierGroup
// @Accept       json
// @Produce      json
// @Param input body entities.ModifierGroupInput true "modifier group params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/modifier-groups/{groupID} [PUT]
func (c *modifiersController) UpdateModifierGroup(ctx *fiber.Ctx) error {
	_, pubID, err := c.checkPubAccess(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	groupID, err := strconv.Atoi(ctx.Params("groupID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	existingGroup, err := c.ModifierGroupRepo.GetGroupByID(groupID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if int(existingGroup.PubID) != pubID {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	groupInput, validationErrors, err := input.ParseRequestBody[entities.ModifierGroupInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	updated, err := c.ModifierGroupRepo.UpdateGroup(groupID, groupInput.ConvertToModel())
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	output := entities.ModifierGroupOutput{}
	output.FillFromModel(updated)

	return h.SendSuccess(ctx, fiber.Map{"modifier_group": output}, fiber.StatusOK)
}

// @Summary      Delete modifier group
// @Tags         ModifierGroup
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /company/{companyID}/pubs/{pubID}/modifier-groups/{groupID} [DELETE]
func (c *modifiersController) DeleteModifierGroup(ctx *fiber.Ctx) error {
	_, pubID, err := c.checkPubAccess(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	groupID, err := strconv.Atoi(ctx.Params("groupID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	existingGroup, err := c.ModifierGroupRepo.GetGroupByID(groupID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if int(existingGroup.PubID) != pubID {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	if err := c.ModifierGroupRepo.DeleteGroup(groupID); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}

// checkPubAccess parses companyID/pubID from the URL and verifies the
// authenticated user has company-level access to that pub - every modifier-
// group route is scoped under .../pubs/:pubID/modifier-groups, so this one
// check covers list/create; update/delete additionally compare the target
// group's own PubID against pubID before acting on it.
func (c *modifiersController) checkPubAccess(ctx *fiber.Ctx) (companyID int, pubID int, err error) {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return 0, 0, err
	}

	companyID, err = strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return 0, 0, httperrors.ErrBadID
	}

	pubID, err = strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return 0, 0, httperrors.ErrBadID
	}

	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return 0, 0, err
	}

	return companyID, pubID, nil
}
