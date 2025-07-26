package middleware

import (
	"fmt"

	h "github.com/alexkalak/qrmenu/src/controllers/httpv1/httphelpers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

var jwtService = jwtservice.New()

func StrictAuthMW(ctx *fiber.Ctx) error {
	accessToken := ctx.Get("accesstoken")

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

	fmt.Println("AUTH USER CLAIMS: ", helpers.ConvertToJSON(userClaims))

	ctx.Locals(locals.USER_ID_LOCALS, userClaims.ID)
	ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, userClaims.Significance)
	ctx.Locals(locals.USER_ROLE_LOCALS, userClaims.RoleName)

	return ctx.Next()
}
