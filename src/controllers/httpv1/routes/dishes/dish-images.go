package dishes

import (
	"fmt"
	"strconv"
	"strings"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/repo/dishesrepo"
	"github.com/gofiber/fiber/v2"
)

type fileUploadOutput struct {
	FileName string `json:"file_name"`
	Ok       bool   `json:"ok" example:"true"`
}

// @Summary      Upload image
// @Description  Uploads dish image(png)
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param dishID path int true "dish id"
// @Param image formData file true "image"
// @Accept       mpfd
// @Produce      mpfd
// @Success      200  {object}  fileUploadOutput
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/{dishID}/image [PATCH]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *dishesController) UploadDishImage(ctx *fiber.Ctx) error {
	fmt.Println("request")
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	companyID, err := strconv.Atoi(ctx.Params("companyID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	dishID, err := strconv.Atoi(ctx.Params("dishID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.CheckAccess(userID, companyID, userSignificance)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	file, err := ctx.FormFile("image")
	if file == nil || err != nil {
		return h.SendError(ctx, httperrors.ErrBadDocument, h.AUTOMATIC_STATUS_CODE)
	}
	fmt.Println("file uploaded")

	fileNameSplitted := strings.Split(file.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	if fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.DishService.UploadDishImage(dishID, file)
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

// @Summary      Get dish image
// @Description  get dish image
// @Tags         dish
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param menuID path int true "menu id"
// @Param categoryID path int true "category id"
// @Param dishID path int true "dish id"
// @Produce      mpfd
// @Router       /company/{companyID}/pubs/{pubID}/menus/{menuID}/categories/{categoryID}/dishes/{dishID}/image [GET]
func (c *dishesController) GetDishImage(ctx *fiber.Ctx) error {
	dishID, err := strconv.Atoi(ctx.Params("dishID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.DishService.GetImageFileName(dishID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return ctx.SendFile(dishesrepo.DISHES_IMAGES_PATH + fileName)
}
