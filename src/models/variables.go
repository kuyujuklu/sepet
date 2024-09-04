package models

import (
	"os"
	"strconv"
)

var DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT int = 10

func ConfigureVariables() error {
	var err error
	DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT, err = strconv.Atoi(os.Getenv("DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT"))
	if err != nil {
		return err
	}

	return nil
}
