package httphelpers

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

func GetUserIDAndSignificanceFromLocals(ctx *fiber.Ctx) (int, int, error) {
	userID, ok := ctx.Locals(locals.USER_ID_LOCALS).(int)
	if !ok {
		return 0, 0, httperrors.ErrUnauthorized
	}

	userSignificance, ok := ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS).(int)
	if !ok {
		return 0, 0, httperrors.ErrUnauthorized
	}
	return userID, userSignificance, nil
}
