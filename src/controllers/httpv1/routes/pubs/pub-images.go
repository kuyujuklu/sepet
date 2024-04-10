package pubs

import (
	"strconv"
	"strings"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/gofiber/fiber/v2"
)

type FileUploadOutput struct {
	FileName string `json:"file_name"`
	Ok       bool   `json:"ok" example:"true"`
}

// @Summary      Upload logo
// @Description  Uploads pub logo(png)
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param logo formData file true "logo"
// @Accept       mpfd
// @Produce      json
// @Success      200  {object}  FileUploadOutput
// @Router       /company/{companyID}/pubs/{pubID}/logo [PATCH]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) UploadPubLogo(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	file, err := ctx.FormFile("logo")
	if file == nil || err != nil {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileNameSplitted := strings.Split(file.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	if fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.PubService.UploadPubLogo(pubID, file)
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

// @Summary      Upload bg
// @Description  Uploads pub bg(png)
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Param bg formData file true "bg"
// @Accept       mpfd
// @Produce      json
// @Success      200  {object}  FileUploadOutput
// @Router       /company/{companyID}/pubs/{pubID}/bg [PATCH]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
func (c *pubController) UploadPubBG(ctx *fiber.Ctx) error {
	userID, userSignificance, err := h.GetUserIDAndSignificanceFromLocals(ctx)
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

	//Checking access for action with pub for company
	err = h.CheckAccess(userID, companyID, userSignificance, models.PUB_COMPANY_ENTITY, pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	file, err := ctx.FormFile("bg")
	if file == nil || err != nil {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileNameSplitted := strings.Split(file.Filename, ".")
	fileExtension := fileNameSplitted[len(fileNameSplitted)-1]
	if fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" {
		return h.SendError(ctx, httperrors.ErrInvalidFileExtension, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.PubService.UploadPubBG(pubID, file)
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

// @Summary      Get pub logo
// @Description  get pub logo
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Produce      mpfd
// @Router       /company/{companyID}/pubs/{pubID}/logo [GET]
func (c *pubController) GetPubLogo(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.PubService.GetPubLogoFileName(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return ctx.SendFile(pubsrepo.PUB_LOGO_FILE_PATH + fileName)
}

// @Summary      Get pub bg
// @Description  get pub bg
// @Tags         pub
// @Param companyID path int true "company id"
// @Param pubID path int true "pub id"
// @Produce      mpfd
// @Router       /company/{companyID}/pubs/{pubID}/bg [GET]
func (c *pubController) GetPubBG(ctx *fiber.Ctx) error {
	pubID, err := strconv.Atoi(ctx.Params("pubID"))
	if err != nil {
		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
	}

	fileName, err := c.PubService.GetPubBGFileName(pubID)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	return ctx.SendFile(pubsrepo.PUB_BACKGROUND_FILE_PATH + fileName)
}
