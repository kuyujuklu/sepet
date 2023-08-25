package disheserrors

import "errors"

var ErrUnableToGetDish = errors.New("unable to get dish")

var ErrUnableToCreateDish = errors.New("unable to create dish")

var ErrUnableToUpdateDish = errors.New("unable to update dish")

var ErrUnableToDeleteDish = errors.New("unable to delete dish")

var ErrDishNotFound = errors.New("dish not found")

var ErrDishHasNoImage = errors.New("dish has no image")
