package orderservice

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/input/entities"
)

type EventType string

const (
	CREATE_EVENT_TYPE        EventType = "CREATE_EVENT"
	UPDATE_EVENT_TYPE        EventType = "UPDATE_EVENT"
	UPDATE_RATING_EVENT_TYPE EventType = "UPDATE_RATING_EVENT"
	GET_ALL_EVENT_TYPE       EventType = "GET_ALL"
)

type WSMessageOrderArray struct {
	EventType EventType              `json:"event_type"`
	Orders    []entities.OrderOutput `json:"orders"`
}

type WSOrderMessage struct {
	EventType EventType            `json:"event_type"`
	Order     entities.OrderOutput `json:"order"`
}
