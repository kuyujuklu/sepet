package menuerrors

import "errors"

var ErrUnableToGetMenu = errors.New("unable to get menu")

var ErrUnableToCreateMenu = errors.New("unable to create menu")

var ErrUnableToUpdateMenu = errors.New("unable to update menu")

var ErrUnableToDeleteMenu = errors.New("unable to delete menu")

var ErrMenuNotFound = errors.New("menu not found")

var ErrNotPubsMenu = errors.New("not pub's menu")

var ErrUnableToFreePlaceForMenu = errors.New("unable to free place for menu")
