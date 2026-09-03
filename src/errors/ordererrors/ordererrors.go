package ordererrors

import "errors"

var ErrOrderNotFound = errors.New("order not found")
var ErrUnableToCreateOrder = errors.New("unable to create order")
var ErrUnableToGetOrder = errors.New("unable to get order")
var ErrUnableToUpdateOrder = errors.New("unable to update order")
var ErrUnknownOrderType = errors.New("unknown order type")
var ErrUnkonwnOrderPaymentType = errors.New("unknown order payment type")
var ErrUnkonwnOrderStatus = errors.New("unknown order status")
var ErrOrderIsAlreadyReserved = errors.New("order is already reserved")
var ErrDishNotAvailable = errors.New("dish is not available")
var ErrInvalidModifierOption = errors.New("modifier option does not belong to this dish")
