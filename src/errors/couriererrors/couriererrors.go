package couriererrors

import "errors"

var ErrUnableToGetCourier = errors.New("unable to get courier")

var ErrUnableToCreateCourier = errors.New("unable to create courier")

var ErrUnableToUpdateCourier = errors.New("unable to update courier")

var ErrUnableToDeleteCourier = errors.New("unable to delete courier")

var ErrCourierNotFound = errors.New("courier not found")

var ErrCourierHaveNoImage = errors.New("courier does not have image")

var ErrCourierCannotReserveThisOrder = errors.New("courier cannot reserve this order")

var ErrNotCouriersOrder = errors.New("not couriers order")
