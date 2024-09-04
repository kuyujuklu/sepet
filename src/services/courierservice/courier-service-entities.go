package courierservice

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
)

type EventType string

const (
	CREATE_EVENT_TYPE  EventType = "CREATE_EVENT"
	UPDATE_EVENT_TYPE  EventType = "UPDATE_EVENT"
	GET_ALL_EVENT_TYPE EventType = "GET_ALL"
)

type WSCourierOrderMessage struct {
	EventType EventType            `json:"event_type"`
	Order     entities.OrderOutput `json:"order"`
}

type WSCourierOrdersMessage struct {
	EventType EventType              `json:"event_type"`
	Orders    []entities.OrderOutput `json:"orders"`
}
