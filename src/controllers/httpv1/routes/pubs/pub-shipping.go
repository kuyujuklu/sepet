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

type SetShippingShapes struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set shipping shapes
// @Description  sets shipping shapes
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetShippingShapes true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  SetShippingShapes
// @Router       /company/{companyID}/pubs/{pubID}/shipping [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetShapesForPub(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetShippingShapes](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	inputShapes := input.ConvertToModel()
	err = c.PubService.EnableShippingAndSetShapes(pubID, inputShapes)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetShippingAvailable struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set shipping availability shapes
// @Description  sets shipping avaliability shapes
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetAvailableShipping true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetShippingAvailable
// @Router       /company/{companyID}/pubs/{pubID}/shipping-availability [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetAvailableShipping(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetAvailableShipping](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetShippingAvailable(pubID, input.Available)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetShippingTime struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set shipping time
// @Description  sets shipping time
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetShippingTime true "time params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetShippingTime
// @Router       /company/{companyID}/pubs/{pubID}/shipping-time [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetShippingTime(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetShippingTime](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetShippingTime(pubID, input.From, input.To)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetShippingWorkingHours struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set shipping day time
// @Description  sets shipping hours of working
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetShippingWorkingHours true "time params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetShippingWorkingHours
// @Router       /company/{companyID}/pubs/{pubID}/shipping-work-hours [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetShippingWorkHoursForWeek(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetShippingWorkHoursInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetShippingWorkHoursForWeek(pubID, input.ConvertToModel())
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetShippingPrice struct {
	Ok bool `json:"ok" example:"true"`
}

// @Summary      Set shipping price
// @Description  sets shipping price
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetShippingPrice true "time params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetShippingPrice
// @Router       /company/{companyID}/pubs/{pubID}/shipping-price [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetShippingPrice(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetShippingPrices](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetShippingPrices(pubID, input.Prices)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

// @Summary      Set shipping price
// @Description  sets shipping price
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetShippingPrice true "time params"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetShippingPrice
// @Router       /company/{companyID}/pubs/{pubID}/shipping-price [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetShippingFreeDeliveryPrice(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetShippingPrices](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetShippingFreeDeliveryPrices(pubID, input.Prices)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
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
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Accept       json
// @Produce      json
// @Success      200  {object}  GetShippingShapes
// @Router       /company/{companyID}/pubs/{pubID}/shipping [GET]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) GetShapesForPub(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	shipping, err := c.PubService.GetShipping(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	shippingOutput := entities.ShippingOutput{}
	shippingOutput.FillFromModel(shipping)

	fmt.Println("RETURNING: ", shippingOutput)

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

type SetDeliveryTypeOutput struct {
	Ok bool `json:"ok"`
}

// @Summary      Set delivery type
// @Description  sets delivery type
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetDeliveryPrice true "delivery price"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetDeliveryTypeOutput
// @Router       /company/{companyID}/pubs/{pubID}/delivery-price [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetDeliveryType(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetDeliveryType](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.UpdatePubDeliveryType(pubID, input.DeliveryType)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetAddCommissionToDishPricesOutput struct {
	Ok bool `json:"ok"`
}

// @Summary      Set add commission to dish prices
// @Description  sets add commission to dish
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.SetAddCommissionToDishPrices true "sets add commission to dish"
// @Accept       json
// @Produce      json
// @Success      200  {object} SetAddCommissionToDishPricesOutput
// @Router       /company/{companyID}/pubs/{pubID}/add-commission-to-dish-prices [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) SetAddCommissionToDishPrices(ctx *fiber.Ctx) error {
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

	// Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SetAddCommissionToDishPricesInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.PubService.SetPubAddCommissionToDishPrices(pubID, input.AddCommissionToDishPrices)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"ok": true,
		},
		fiber.StatusOK)
}

type SetFreeDeliveryFromOutput struct {
	Ok bool `json:"ok"`
}
