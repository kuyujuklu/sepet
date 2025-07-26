package auth

import (
	"errors"
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input"
	"github.com/alexkalak/qrmenu/src/errors/companyerrors"
	"github.com/alexkalak/qrmenu/src/errors/couriererrors"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/adminservice"
	"github.com/alexkalak/qrmenu/src/services/authservice"
	"github.com/alexkalak/qrmenu/src/services/clientservice"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
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
	CourierService courierservice.CourierService
	RoleService    roleservice.RoleService
	AdminService   adminservice.AdminService
	ClientService  clientservice.ClientService
	AuthService    authservice.AuthService
}

func New() *authController {
	return &authController{
		JwtService:     jwtservice.New(),
		CompanyService: companyservice.New(),
		RoleService:    roleservice.New(),
		AdminService:   adminservice.New(),
		ClientService:  clientservice.New(),
		CourierService: courierservice.New(),
		AuthService:    authservice.New(),
	}
}

func (c *authController) UnauthorizedRouter(router fiber.Router) {
	router.Post("/login", c.Login)
	router.Post("/logout", c.Logout)
	router.Post("/refresh-token", c.RefreshToken)
}

type loginInput struct {
	Email       string `json:"email" example:"alex@alex.alex"`                          // for companies and admins
	PhoneNumber string `json:"phone" example:"37367507188"`                             // for users
	Password    string `json:"password" validate:"omitempty,min=3" example:"123123123"` // for companies and admins
	As          string `json:"as" validate:"" example:"company"`                        // for all
}

type LoginOutput struct {
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
// @Success      200  {object}  LoginOutput
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
	case "":
		return c.loginAsUnknown(ctx, loginInput.Email, loginInput.Password)
	default:
		return h.SendError(ctx, errors.New("not valid role"), fiber.StatusBadRequest)
	}
}

func (c *authController) loginAsUnknown(ctx *fiber.Ctx, email string, password string) error {
	user, err := c.AuthService.Login(email, password)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, user.ID, user.SignificanceNumber, user.Role)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	if user.Role == models.ADMIN_ROLE_NAME {
		err = h.SendAdminRefreshTokenInHttpOnlyCookies(ctx, user.ID, user.SignificanceNumber, user.Role)
		if err != nil {
			return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
		}
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		user.ID,
		user.SignificanceNumber,
		user.Role,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)
	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
			"role":        user.Role,
		},
		fiber.StatusOK,
	)
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

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(company.ID), role.SignificanceNumber, models.COMPANY_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(company.ID),
		role.SignificanceNumber,
		models.COMPANY_ROLE_NAME,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)
	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
			"role":        models.COMPANY_ROLE_NAME,
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

	err = h.SendRefreshTokenInHttpOnlyCookies(ctx, int(admin.ID), role.SignificanceNumber, models.ADMIN_ROLE_NAME)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}
	err = h.SendAdminRefreshTokenInHttpOnlyCookies(ctx, int(admin.ID), role.SignificanceNumber, models.ADMIN_ROLE_NAME)
	if err != nil {
		fmt.Println("Error in sending admin refresh_token")
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(admin.ID),
		role.SignificanceNumber,
		models.ADMIN_ROLE_NAME,
		jwtservice.ADMIN_ACCESS_LIFE_TIME)
	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"role":        models.ADMIN_ROLE_NAME,
			"accesstoken": accessToken,
		},
		fiber.StatusOK,
	)
}

func (c *authController) Logout(ctx *fiber.Ctx) error {
	h.DeleteRefreshToken(ctx)
	h.DeleteAdminRefreshToken(ctx)
	return h.SendSuccess(ctx, fiber.Map{}, fiber.StatusOK)
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

	adminRefreshToken := ctx.Cookies(("admin_refresh_token"))
	adminClaims, valid, err := c.JwtService.ParseJwtTokenString(adminRefreshToken)
	if err == nil && valid && adminClaims.RoleName == models.ADMIN_ROLE_NAME {
		fmt.Println("IS ADDDDDDMIn")
	}

	userID := 0
	company := models.Company{}
	courier := models.Courier{}
	client := models.Client{}

	if userClaims.RoleName == models.COMPANY_ROLE_NAME {
		company, err = c.CompanyService.GetCompanyById(userClaims.ID)
		if err != nil {
			return h.SendError(
				ctx,
				companyerrors.ErrCompanyNotFound,
				h.AUTOMATIC_STATUS_CODE,
			)
		}
		userID = int(company.ID)
	} else if userClaims.RoleName == models.COURIER_ROLE_NAME {
		courier, err = c.CourierService.GetCourierByID(userClaims.ID)
		if err != nil {
			return h.SendError(
				ctx,
				couriererrors.ErrCourierNotFound,
				h.AUTOMATIC_STATUS_CODE,
			)
		}
		userID = int(courier.ID)
	} else if userClaims.RoleName == models.CLIENT_ROLE_NAME {
		client, err = c.ClientService.GetClientByID(userClaims.ID)
		if err != nil {
			return h.SendError(
				ctx,
				couriererrors.ErrCourierNotFound,
				h.AUTOMATIC_STATUS_CODE,
			)
		}
		userID = int(client.ID)
	}

	accessToken, err := c.JwtService.GetAccessTokenString(
		int(userID),
		userClaims.Significance,
		userClaims.RoleName,
		jwtservice.STANDARD_ACCESS_LIFE_TIME)
	if err != nil {
		return h.SendError(ctx, servererrors.ErrInternalServerError, h.AUTOMATIC_STATUS_CODE)
	}

	return h.SendSuccess(
		ctx,
		fiber.Map{
			"accesstoken": accessToken,
			"role":        userClaims.RoleName,
		},
		fiber.StatusOK)
}
