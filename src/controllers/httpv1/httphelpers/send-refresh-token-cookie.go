package httphelpers

import (
	"time"

	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/fiber/v2"
)

var jwtService = jwtservice.New()

func SendRefreshTokenInHttpOnlyCookies(ctx *fiber.Ctx, userID int, userSignificance int, userRole string) error {
	refresh_token, err := jwtService.GetRefreshTokenString(userID, userSignificance, userRole, jwtservice.STANDARD_REFRESH_LIFE_TIME)
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	ctx.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refresh_token,
		Expires:  time.Now().Add(jwtservice.STANDARD_REFRESH_LIFE_TIME),
		HTTPOnly: true,
	})

	return nil
}

func SendAdminRefreshTokenInHttpOnlyCookies(ctx *fiber.Ctx, userID int, userSignificance int, userRole string) error {
	refresh_token, err := jwtService.GetRefreshTokenString(userID, userSignificance, userRole, jwtservice.STANDARD_REFRESH_LIFE_TIME)
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	ctx.Cookie(&fiber.Cookie{
		Name:     "admin_refresh_token",
		Value:    refresh_token,
		Expires:  time.Now().Add(jwtservice.STANDARD_REFRESH_LIFE_TIME),
		HTTPOnly: true,
	})

	return nil
}

func DeleteRefreshToken(ctx *fiber.Ctx) {
	ctx.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
	})
}

func DeleteAdminRefreshToken(ctx *fiber.Ctx) {
	ctx.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
	})
}
