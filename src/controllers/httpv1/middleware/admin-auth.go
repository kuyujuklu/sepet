package middleware

import (
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

	// adminClaims is nil whenever the cookie is absent/invalid (the common
	// case for a request authenticated by access token alone) -
	// ParseJwtTokenString returns a nil *UserClaims on any parse failure,
	// so it must never be dereferenced outside this specific success path.
	adminRefreshToken := ctx.Cookies("admin_refresh_token")
	adminClaims, valid, err := jwtService.ParseJwtTokenString(adminRefreshToken)

	if err == nil && valid && adminClaims.RoleName == models.ADMIN_ROLE_NAME {
		isAdmin = true
		// Only this cookie-fallback path needs to (re-)set locals - it's
		// what lets a superadmin who's currently impersonating a venue
		// (access token scoped to that company, not admin) still pass
		// admin-only routes. The plain access-token path above already has
		// correct locals from StrictAuthMW.
		ctx.Locals(locals.USER_ID_LOCALS, adminClaims.ID)
		ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, models.ADMIN_SIGNIFICANCE)
		ctx.Locals(locals.USER_ROLE_LOCALS, models.ADMIN_ROLE_NAME)
	}

	if !isAdmin {
		return h.SendError(ctx, httperrors.ErrForbidden, h.AUTOMATIC_STATUS_CODE)
	}

	return ctx.Next()
}
