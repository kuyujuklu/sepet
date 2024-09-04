package categories

import (
	"strconv"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/gofiber/fiber/v2"
)

type moveMenuOutput struct {
	Ok    bool `json:"ok" example:"true"`
	Place int  `json:"place"`
}

// @Summary      Move cateogory lft
// @Description  Moves category left
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Produce      json
// @Success      200  {object}  moveMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/move-left [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *categoryController) MoveCategoryLeft(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	categoryID, err := strconv.Atoi(ctx.Params("categoryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with category for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.CATEGORY_COMPANY_ENTITY, categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	place, err := c.CategoryService.MoveCategoryLeft(categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"place": place,
		},
		fiber.StatusOK)
}

// @Summary      Move cateogory right
// @Description  Moves category right
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Produce      json
// @Success      200  {object}  moveMenuOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/move-right [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *categoryController) MoveCategoryRight(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	categoryID, err := strconv.Atoi(ctx.Params("categoryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//Checking access for action with category for company
	err = h.CheckCompanyAccess(userID, companyID, userSignificance, userRole, models.CATEGORY_COMPANY_ENTITY, categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	place, err := c.CategoryService.MoveCategoryRight(categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"place": place,
		},
		fiber.StatusOK)
}
