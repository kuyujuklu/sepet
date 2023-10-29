package tarifferrors

import "errors"

var ErrTariffNotFound = errors.New("tariff not found")

var ErrUnableToGetTariff = errors.New("unable to get tariff")
