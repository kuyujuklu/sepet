package admin

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

// @Summary      List push campaigns
// @Description  Send history for the superadmin push composer, newest first
// @Tags         admin
// @Produce      json
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/push-campaigns [GET]
func (c *adminController) GetAllPushCampaigns(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	campaigns, err := c.PushCampaignService.GetAll()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	campaignsOutput := make([]entities.PushCampaignOutput, 0, len(campaigns))
	for _, campaign := range campaigns {
		campaignOutput := entities.PushCampaignOutput{}
		campaignOutput.FillFromModel(campaign)
		campaignsOutput = append(campaignsOutput, campaignOutput)
	}

	return h.SendSuccess(ctx, fiber.Map{"campaigns": campaignsOutput}, fiber.StatusOK)
}

// @Summary      Create a push campaign
// @Description  Sends immediately, or stores as scheduled when scheduled_at is set
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input body entities.PushCampaignInput true "campaign params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/push-campaigns [POST]
func (c *adminController) CreatePushCampaign(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	campaignInput, validationErrors, err := input.ParseRequestBody[entities.PushCampaignInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	serviceInput, err := campaignInput.ToServiceInput()
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}

	created, err := c.PushCampaignService.CreateCampaign(serviceInput)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	campaignOutput := entities.PushCampaignOutput{}
	campaignOutput.FillFromModel(created)

	return h.SendSuccess(ctx, fiber.Map{"campaign": campaignOutput}, fiber.StatusOK)
}

// @Summary      Preview how many clients a given audience resolves to
// @Tags         admin
// @Produce      json
// @Param        audienceType query string true "all | pub_customers | inactive | first_time | frequent"
// @Param        pubID query int false "required for pub_customers"
// @Param        inactiveDays query int false "required for inactive"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/push-campaigns/audience-preview [GET]
func (c *adminController) PreviewPushCampaignAudience(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	audienceType := ctx.Query("audienceType")
	pubID, _ := strconv.Atoi(ctx.Query("pubID"))
	inactiveDays, _ := strconv.Atoi(ctx.Query("inactiveDays"))

	count, err := c.PushCampaignService.PreviewAudienceCount(audienceType, pubID, inactiveDays)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{"count": count}, fiber.StatusOK)
}

// @Summary      Send a one-off test push to a single phone number
// @Description  Not tracked in campaign history - purely for previewing copy/deep-link on a real device before sending to a full audience
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input body entities.PushCampaignTestSendInput true "test send params"
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// @Router       /admin/push-campaigns/test-send [POST]
func (c *adminController) TestSendPushCampaign(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if !h.IsAdmin(userSignificance) {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	testInput, validationErrors, err := input.ParseRequestBody[entities.PushCampaignTestSendInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	if err := c.PushCampaignService.SendTest(testInput.ToServiceInput()); err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
}
