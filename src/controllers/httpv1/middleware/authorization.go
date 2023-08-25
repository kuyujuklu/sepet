package middleware

import (
	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

var jwtService = jwtservice.New()

// func AuthMW(ctx *fiber.Ctx) error {
// 	accessToken := ctx.Cookies("access_token")

// 	if accessToken == "" {
// 		ctx.Locals("authorized", false)
// 		ctx.Locals("authorization-error", "empty access token")
// 		return ctx.Next()
// 	}

// 	userClaims, ok, err := jwtService.ParseJwtTokenString(accessToken)
// 	if err != nil {
// 		if err.Error() == "token expired" {
// 			ctx.Locals("authorized", false)
// 			ctx.Locals("authorization-error", "access token expired")
// 			return ctx.Next()
// 		}

// 		if err.Error() == "token signature invalid" {
// 			ctx.Locals("authorized", false)
// 			ctx.Locals("authorization-error", "access token signature invalid")
// 			return ctx.Next()
// 		}

// 		ctx.Locals("authorized", false)
// 		ctx.Locals("authorization-error", "acces token invalid")
// 		return ctx.Next()
// 	}

// 	if !ok {
// 		ctx.Locals("authorized", false)
// 		ctx.Locals("authorization-error", "acces token invalid")
// 		return ctx.Next()
// 	}

// 	ctx.Locals("authorized", true)
// 	ctx.Locals("user-id", userClaims.ID)
// 	ctx.Locals("user-role", userClaims.Role)

// 	return ctx.Next()
// }

func StrictAuthMW(ctx *fiber.Ctx) error {
	accessToken := ctx.Get("access_token")

	if accessToken == "" {
		return h.SendError(ctx, jwterrors.ErrEmptyAccessToken, h.AUTOMATIC_STATUS_CODE)
	}

	userClaims, ok, err := jwtService.ParseJwtTokenString(accessToken)
	if err != nil {
		switch err {
		case jwterrors.ErrTokenExpired:
			return h.SendError(ctx, jwterrors.ErrTokenExpired, h.AUTOMATIC_STATUS_CODE)
		case jwterrors.ErrNotValidSignature:
			return h.SendError(ctx, jwterrors.ErrNotValidSignature, h.AUTOMATIC_STATUS_CODE)
		default:
			return h.SendError(ctx, jwterrors.ErrNotValidToken, h.AUTOMATIC_STATUS_CODE)
		}
	}

	if !ok {
		return h.SendError(ctx, jwterrors.ErrNotValidToken, h.AUTOMATIC_STATUS_CODE)
	}

	ctx.Locals(locals.USER_ID_LOCALS, userClaims.ID)
	ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, userClaims.Significance)
	return ctx.Next()
}
