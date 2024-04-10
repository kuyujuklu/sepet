package input

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/gofiber/fiber/v2"
)

type Model interface{}

type Input interface {
}
type Output[M Model] interface {
	FillFromModel(model M) Output[M]
}

func ParseRequestBody[I Input](ctx *fiber.Ctx) (I, []ValidationError, error) {
	var input I

	err := ctx.BodyParser(&input)
	if err != nil {
		fmt.Println("error parsing body: ", err)
		return input, nil, httperrors.ErrBadBody
	}

	validationErrors := Validate(input)
	return input, validationErrors, nil
}

func FillFromModel[M Model](model M) Output[M] {
	var output Output[M]
	return output.FillFromModel(model)
}
