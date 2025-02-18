package orders

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type UpdateOrderStatusOutput struct {
	Ok  bool   `json:"ok" example:"true"`
	Err string `json:"err" example:""`
}

// @Summary      Update order status
// @Description  updates order status
// @Tags         Pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param status query string true "pub params"
// @Produce      json
// @Success      200  {object}  UpdateOrderStatusOutput
// @Router       /api/company/{companyID}/pubs/{pubID}/orders/update-status?status={} [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *ordersController) UpdateOrderStatus(ctx *fiber.Ctx) error {
	status := ctx.Query("status")
	err := models.CheckOrderStatusCorrectness(status)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.OrderService.UpdateOrderStatus(orderID, status)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	return h.SendSuccess(
		ctx,
		fiber.Map{
			"status": status,
		},
		fiber.StatusOK)
}

// @Summary      Update order delivery price
// @Description  updates order delivery price
// @Tags         Pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param price query string true "price param"
// @Produce      json
// @Success      200  {object}  UpdateOrderStatusOutput
// @Router       /api/company/{companyID}/pubs/{pubID}/orders/update-delivery-price?price={} [GET]
// @Param AccessToken header string  true "accesstoken"
func (c *ordersController) UpdateOrderDeliveryPrice(ctx *fiber.Ctx) error {
	priceInput := ctx.Query("price")
	price, err := strconv.ParseFloat(priceInput, 64)
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadBody, h.AUTOMATIC_STATUS_CODE)
	}
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.OrderService.UpdateOrderDeliveryPrice(orderID, price)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	return h.SendSuccess(
		ctx,
		fiber.Map{
			"delivery_price": price,
		},
		fiber.StatusOK)
}

type UpdateOrderDishesInput struct {
	Dishes []entities.OrderDishInput `json:"dishes"`
}

type UpdateOrderDishesOutput struct {
	Ok     bool                       `json:"ok" example:"true"`
	Err    string                     `json:"err" example:""`
	Dishes []entities.OrderDishOutput `json:"dishes"`
}

// @Summary      Update order status
// @Description  updates order status
// @Tags         Pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param input body UpdateOrderDishesInput true "pub params"
// @Produce      json
// @Success      200  {object}  UpdateOrderDishesOutput
// @Router       /api/company/{companyID}/pubs/{pubID}/orders/update-dishes [PUT]
// @Param AccessToken header string  true "accesstoken"
func (c *ordersController) UpdateOrderDishes(ctx *fiber.Ctx) error {
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[UpdateOrderDishesInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	isCommissionNeeded, err := c.OrderService.IsCommissionNeededForOrderArgsIDs(orderID, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	inputDishes := make([]models.OrderDish, 0, len(input.Dishes))
	for _, inputDish := range input.Dishes {
		inputDishes = append(inputDishes, models.OrderDish{
			Count:  inputDish.Count,
			DishID: inputDish.DishID,
		})
	}
	dishes, err := c.OrderService.FillDishPrices(pubID, inputDishes, isCommissionNeeded)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = c.OrderService.UpdateOrderDishes(orderID, dishes)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"dishes": dishes,
		},
		fiber.StatusOK)
}

type UpdateOrderPreparedInput struct {
	Prepared bool `json:"prepared"`
}

type UpdateOrderPreparedOutput struct {
	Prepared bool `json:"prepared"`
}

func (c *ordersController) UpdateOrderPrepared(ctx *fiber.Ctx) error {
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

	orderID, err := strconv.Atoi(ctx.Params("orderID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with pub for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	input, validationErrors, err := input.ParseRequestBody[UpdateOrderPreparedInput](ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	err = c.OrderService.UpdateOrderPrepared(orderID, input.Prepared)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"prepared": input.Prepared,
		},
		fiber.StatusOK)
}
