package ordererrors

import "errors"

var ErrOrderNotFound = errors.New("order not found")
var ErrUnableToCreateOrder = errors.New("unable to create order")
var ErrUnknownOrderType = errors.New("unknown order type")
var ErrUnkonwnOrderPaymentType = errors.New("unknown order payment type")
var ErrUnkonwnOrderStatus = errors.New("unknown order status")
