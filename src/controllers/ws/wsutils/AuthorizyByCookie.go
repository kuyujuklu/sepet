package wsutils

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

var jwtService = jwtservice.New()

func AuthorizeByCookie(ctx *fiber.Ctx) error {
	accessToken := ctx.Query("access_token")
	fmt.Println("in websocket authorization")

	if accessToken == "" {
		return jwterrors.ErrEmptyAccessToken
	}

	userClaims, ok, err := jwtService.ParseJwtTokenString(accessToken)
	if err != nil {
		switch err {
		case jwterrors.ErrTokenExpired:
			return jwterrors.ErrTokenExpired
		case jwterrors.ErrNotValidSignature:
			return jwterrors.ErrNotValidSignature
		default:
			return jwterrors.ErrNotValidToken
		}
	}

	if !ok {
		return jwterrors.ErrNotValidToken
	}

	fmt.Println("setting locals usr id: ", userClaims.ID)
	fmt.Println("setting locals usr sig: ", userClaims.Significance)
	fmt.Println("setting locals usr role: ", userClaims.RoleName)

	ctx.Locals(locals.USER_ID_LOCALS, userClaims.ID)
	ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, userClaims.Significance)
	ctx.Locals(locals.USER_ROLE_LOCALS, userClaims.RoleName)
	return nil
}
