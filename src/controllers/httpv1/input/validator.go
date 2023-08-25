package input

import (
	"github.com/go-playground/validator/v10"
)

type ValidationError struct {
	Field string `json:"field"`
	Tag   string `json:"tag"`
	Err   string `json:"err"`
}

var validate *validator.Validate

func GetValidator() *validator.Validate {
	if validate != nil {
		return validate
	}
	validate = validator.New()
	return validate
}

func Validate(structure interface{}) []ValidationError {
	var errors []ValidationError

	err := GetValidator().Struct(structure)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var element ValidationError
			element.Field = err.Field()
			element.Tag = err.Tag()
			element.Err = err.Param()
			errors = append(errors, element)
		}
	}
	return errors
}
