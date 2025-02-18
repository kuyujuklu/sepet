package admin

import (
	"fmt"
	"sort"
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/notificationservice"
	"github.com/gofiber/fiber/v2"
)

type UpdatePubExpirationTimeOutput struct {
	Ok  bool               `json:"ok" example:"true"`
	Pub entities.PubOutput `json:"pub"`
}

func (c *adminController) CheckAdmin(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(ctx, fiber.Map{}, h.AUTOMATIC_STATUS_CODE)
}

// @Summary      Update pub expiration time
// @Description  Updates pub expiration
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  UpdatePubExpirationTimeOutput
// @Router       /company/{companyID}/pubs/{pubID}/expiration-time [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) UpdatePubExpirationTime(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.UpdateExpirationTimeInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	time, err := c.PubService.ExtendSubscription(pubID, input.Days)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"expiration_time_utc": helpers.ConvertToStandardApiTime(time),
		},
		fiber.StatusOK)
}

// @Summary      Update pub expiration time
// @Description  Updates pub expiration
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  UpdatePubExpirationTimeOutput
// @Router       /company/{companyID}/pubs/{pubID}/expiration-time [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"

func (c *adminController) GetPubRefreshToken(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	pubID, err := strconv.Atoi(ctx.Query("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	pub, err := c.PubService.GetPubById(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	company := pub.Company

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(company.ID), models.COMPANY_SIGNIFICANCE, models.COMPANY_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusOK)
}

type UpdatePubTariff struct {
	Ok     bool   `json:"ok" example:"true"`
	Tariff string `json:"pub"`
}

// @Summary      Update pub expiration time
// @Description  Updates pub expiration
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.CompanyUpdateTariffInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  UpdatePubTariff
// @Router       /company/{companyID}/pubs/{pubID}/expiration-time [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) UpdateCompanyTariff(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.CompanyUpdateTariffInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	company, err := c.CompanyService.UpdateCompanyTariff(companyID, input.Tariff)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"tariff": company.Tariff.Name,
		},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/pubs [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) GetAllPub(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	pubs, err := c.PubService.GetAllPubs()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	sort.Slice(pubs, func(i, j int) bool {
		return pubs[i].ID > pubs[j].ID
	})

	pubsOutput := make([]entities.PubOutput, 0, len(pubs))
	for _, pub := range pubs {
		pubOutput := entities.PubOutput{}
		err := pubOutput.FillFromModel(pub)
		if err != nil {
			fmt.Println("pub converting error in admin-pubs.go")
			continue
		}
		pubsOutput = append(pubsOutput, pubOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"pubs": pubsOutput,
		},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/pubs [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) GetAllCouriers(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	couriers, err := c.CourierService.GetAllCouriers()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	sort.Slice(couriers, func(i, j int) bool {
		return couriers[i].ID > couriers[j].ID
	})

	couriersOutput := make([]entities.CourierOutput, 0, len(couriers))
	for _, courier := range couriers {
		courierOutput := entities.CourierOutput{}
		courierOutput.FillFromModel(courier)
		couriersOutput = append(couriersOutput, courierOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"couriers": couriersOutput,
		},
		fiber.StatusOK)
}

type AddToBalanceInput struct {
	Amount float64 `json:"amount"`
}

func (c *adminController) AddToCourierBalance(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[AddToBalanceInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	updatedBalance, err := c.CourierService.AddToCourierBalance(courierID, input.Amount)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"updated_balance": updatedBalance,
		},
		fiber.StatusOK)
}

func (c *adminController) AddToOrderCourierDebit(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[AddToBalanceInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	updatedCourierInfo, err := c.OrderService.AddToOrderCourierInfoCourierDebit(orderID, input.Amount)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierInfoOutput := entities.OrderCourierInfoOutput{}
	courierInfoOutput.FillFromModel(updatedCourierInfo)

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"updated_courier_info": courierInfoOutput,
		},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/orders [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) GetAllOrders(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	status := ctx.Query("status")

	orders := make([]models.Order, 0)

	if status == "" {
		orders, err = c.OrderService.GetAllOrders()
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}
	}

	if status == "in-process" {
		fmt.Println("in process")
		orders, err = c.OrderService.GetAllOrdersWithSpecificStatuses(models.NOT_HANDLED_ORDER_STATUS, models.HANDLED_ORDER_STATUS, models.PREPARING_ORDER_STATUS, models.AT_COURIER_ORDER_STATUS)
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}
	}

	sort.Slice(orders, func(i, j int) bool {
		return orders[i].ID > orders[j].ID
	})

	ordersOutput := make([]entities.OrderOutputWithoutPub, 0, len(orders))
	for _, order := range orders {
		orderOutput := entities.OrderOutputWithoutPub{}
		orderOutput.FillFromModel(order)
		ordersOutput = append(ordersOutput, orderOutput)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"orders": ordersOutput,
		},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/orders [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) GetAllClients(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	clients, err := c.ClientService.GetAllClients()
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"clients": clients,
		},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/orders [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) SendNotificationToAllClients(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SendToAllClientNotificationRequest](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.NotificationService.SendToAllClients(
		notificationservice.NotificaitonText{
			Ru: input.TitleRu,
			Ro: input.TitleRo,
		}, notificationservice.NotificaitonText{
			Ru: input.BodyRu,
			Ro: input.BodyRo,
		})

	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusOK)
}

// @Summary      Get all pubs
// @Description  get all pubs
// @Tags         admin
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body entities.UpdateExpirationTimeInput true "pub params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  updatePubExpirationTimeOutput
// @Router       /admin/orders [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *adminController) SendToToken(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)
	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[entities.SendNotificationToToken](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.NotificationService.SendNotificationWithToken(
		input.Token,
		input.Lang,
		notificationservice.NotificaitonText{
			Ru: input.TitleRu,
			Ro: input.TitleRo,
		}, notificationservice.NotificaitonText{
			Ru: input.BodyRu,
			Ro: input.BodyRo,
		})

	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{},
		fiber.StatusOK)
}
