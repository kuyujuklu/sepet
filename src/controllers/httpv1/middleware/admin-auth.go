package middleware

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

var jwtvervice = jwtservice.New()

func AdminAuthMW(ctx *fiber.Ctx) error {
	_, userSignificance, _, err := h.GetUserIDSignificanceAndRoleFromLocals(ctx)
	if err != nil {
		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
	}

	isAdmin := h.IsAdmin(userSignificance)

	adminRefreshToken := ctx.Cookies("admin_refresh_token")
	adminClaims, valid, err := jwtService.ParseJwtTokenString(adminRefreshToken)

	fmt.Println("HEEEOOEEO")
	if err == nil && valid && adminClaims.RoleName == models.ADMIN_ROLE_NAME {
		fmt.Println("HEEEEEEEEEEEEEEEEEEEEEE")
		isAdmin = true
	}
	fmt.Println("LKJSDLKFJSDL")

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	ctx.Locals(locals.USER_ID_LOCALS, adminClaims.ID)
	ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, models.ADMIN_SIGNIFICANCE)
	ctx.Locals(locals.USER_ROLE_LOCALS, models.ADMIN_ROLE_NAME)

	return ctx.Next()
}
