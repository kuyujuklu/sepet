package httphelpers

import "github.com/gofiber/fiber/v2"

func SendSuccess(ctx *fiber.Ctx, m fiber.Map, statusCode int) error {
	if statusCode == AUTOMATIC_STATUS_CODE {
		statusCode = fiber.StatusOK
	}

	ctx.SendStatus(statusCode)

	m["ok"] = true
	return ctx.JSON(m)
}
