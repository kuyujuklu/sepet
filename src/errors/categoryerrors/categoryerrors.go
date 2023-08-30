package categoryerrors

import "errors"

var ErrUnableToGetCategory = errors.New("unable to get category")

var ErrUnableToCreateCategory = errors.New("unable to create category")

var ErrUnableToUpdateCategory = errors.New("unable to update category")

var ErrUnableToDeleteCategory = errors.New("unable to delete category")

var ErrCategoryNotFound = errors.New("category not found")

var ErrCategoryHaveNoImage = errors.New("category does not have image")

var ErrUnableToFreePlaceForCategory = errors.New("unable to free place for category")
