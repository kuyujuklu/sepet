package auth

import (
	"errors"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/adminservice"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/roleservice"
	"github.com/gofiber/fiber/v2"
)

const (
	AS_COMPANY = "company"
	AS_ADMIN   = "admin"
)

type authController struct {
	JwtService     jwtservice.JwtService
	CompanyService companyservice.CompanyService
	RoleService    roleservice.RoleService
	AdminService   adminservice.AdminService
}

func New() *authController {
	return &authController{
		JwtService:     jwtservice.New(),
		CompanyService: companyservice.New(),
		RoleService:    roleservice.New(),
		AdminService:   adminservice.New(),
	}
}

func (c *authController) UnauthorizedRouter(router fiber.Router) {
	router.Post("/login", c.Login)
	router.Post("/refresh-token", c.RefreshToken)
}

type loginInput struct {
	Email    string `json:"email" validate:"required" example:"alex@alex.alex"` //if as is equal to AS_COMPANY
	Password string `json:"password" validate:"required" example:"123123123"`
	As       string `json:"as" validate:"required" example:"company"`
}

type loginOutput struct {
	Ok          bool   `json:"ok" example:"true"`
	AccessToken string `json:"accesstoken"`
}

// @Summary      Login
// @Description  returns acces_token and writes refresh_token in httpOnly cookie
// @Tags         auth
// @id login
// @Accept       json
// @Param input body loginInput true "login input"
// @Produce      json
// @Success      200  {object}  loginOutput
// @Router       /auth/login [post]
func (c *authController) Login(ctx *fiber.Ctx) error {
	loginInput, validationErrors, err := input.ParseRequestBody[loginInput](ctx)
	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}
	if len(validationErrors) > 0 {
		return h.SendValidationErrors(ctx, validationErrors)
	}

	switch loginInput.As {
	case AS_COMPANY:
		return c.loginAsCompany(ctx, loginInput.Email, loginInput.Password)
	case AS_ADMIN:
		return c.loginAsAdmin(ctx, loginInput.Email, loginInput.Password)
	default:
		return h.SendError(ctx, errors.New("not valid role"), fiber.StatusBadRequest)
	}
}

func (c *authController) loginAsCompany(ctx *fiber.Ctx, email string, password string) error {
	company, err := c.CompanyService.Login(email, password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	role, err := c.RoleService.GetRoleByName(models.COMPANY_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(company.ID), role.SignificanceNumber)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(company.ID),
		role.SignificanceNumber,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
		},
		fiber.StatusOK,
	)
}

func (c *authController) loginAsAdmin(ctx *fiber.Ctx, adminName string, password string) error {
	admin, err := c.AdminService.Login(adminName, password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	role, err := c.RoleService.GetRoleByName(models.ADMIN_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(admin.ID), role.SignificanceNumber)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(admin.ID),
		role.SignificanceNumber,
		jwtservice.ADMIN_ACCESS_LIFE_TIME)

	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
		},
		fiber.StatusOK,
	)
}

func (c *authController) RefreshToken(ctx *fiber.Ctx) error {
	refreshToken := ctx.Cookies("refresh_token")
	if refreshToken == "" {
		return h.SendError(ctx, jwterrors.ErrEmptyRefreshToken, h.AUTOMATIC_STATUS_CODE)
	}

	userClaims, valid, err := c.JwtService.ParseJwtTokenString(refreshToken)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	if !valid {
		return h.SendError(ctx, jwterrors.ErrNotValidSignature, h.AUTOMATIC_STATUS_CODE)
	}

	user, err := c.CompanyService.GetCompanyById(userClaims.ID)
	if err != nil {
		return h.SendError(
			ctx,
			companyerrors.ErrCompanyNotFound,
			h.AUTOMATIC_STATUS_CODE,
		)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(user.ID),
		user.Role.SignificanceNumber,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)

	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
		},
		fiber.StatusOK)
}
