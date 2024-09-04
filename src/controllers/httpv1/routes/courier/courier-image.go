package courier

import (
	"strconv"
	"strings"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type FileUploadOutput struct {
	FileName string `json:"file_name"`
	Ok       bool   `json:"ok" example:"true"`
}

// @Summary      Upload courier image
// @Description  Uploads courier image(png)
// @Tags         category
// @Param courierID path int true "courier id"
// @Param image formData file true "image"
// @Accept       mpfd
// @Produce      mpfd
// @Success      200  {object}  FileUploadOutput
// @Router       /courier/{courierID}/image [POST]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *courierController) UploadCourierImage(ctx *fiber.Ctx) error {
	userID, userSignificance, userRole, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	courierID, err := strconv.Atoi(ctx.Params("courierID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	//checkign access
	err = h.CheckAccessForCourierAction(userID, courierID, userSignificance, userRole)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	file, err := ctx.FormFile("image")
	if file == nil || err != nil {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileNameSplitted := strings.Split(file.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	if fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.CourierService.UploadCourierImage(courierID, file)
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
