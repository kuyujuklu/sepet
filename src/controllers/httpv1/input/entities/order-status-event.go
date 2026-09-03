package entities

import (
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type OrderStatusEventOutput struct {
	Status       string `json:"status" example:"preparing"`
	CreatedAtUTC string `json:"created_at_utc" example:"2006-01-02 15:04:05"`
}

func (o *OrderStatusEventOutput) FillFromModel(m models.OrderStatusEvent) {
	o.Status = m.Status
	o.CreatedAtUTC = helpers.ConvertToStandardApiTime(m.CreatedAt)
}
