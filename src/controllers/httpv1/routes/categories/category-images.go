package categories

import (
	"strconv"
	"strings"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/repo/categoryrepo"
	"github.com/gofiber/fiber/v2"
)

type fileUploadOutput struct {
	FileName string `json:"file_name"`
	Ok       bool   `json:"ok" example:"true"`
}

// @Summary      Upload image
// @Description  Uploads category image(png)
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param image formData file true "image"
// @Accept       mpfd
// @Produce      mpfd
// @Success      200  {object}  fileUploadOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/image [PATCH]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *categoryController) UploadCategoryImage(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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

	err = h.CheckAccessForCompanyAction(userID, companyID, userSignificance)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	file, err := ctx.FormFile("image")
	if file == nil || err != nil {
		return h.SendError(ctx, httperrors.ErrBadDocument, h.AUTOMATIC_STATUS_CODE)
	}

	fileNameSplitted := strings.Split(file.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	if fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.CategoryService.UploadCategoryImage(categoryID, file)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"file_name": fileName,
		},
		fiber.StatusOK)
}

// @Summary      Get category image
// @Description  get category image
// @Tags         category
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Produce      mpfd
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/image [GET]
func (c *categoryController) GetCategoryImage(ctx *fiber.Ctx) error {
	categoryID, err := strconv.Atoi(ctx.Params("categoryID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.CategoryService.GetImageFileName(categoryID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return ctx.SendFile(categoryrepo.CATEGORY_IMAGES_PATH + fileName)
}
