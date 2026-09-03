package models

import "time"

// One row per order status transition (including the initial "not_handled"
// on creation), so real elapsed time between stages can be shown on the
// order's timeline and averaged per delivery zone for the "estimated ready
// time" feature - neither is possible from Order alone, since it only ever
// holds the *current* status and a single UpdatedAt that gets overwritten
// on every change.
type OrderStatusEvent struct {
	ID        uint `gorm:"primaryKey"`
	OrderID   uint
	PubID     uint   // denormalized so the average query doesn't need to join Order
	ShapeID   string // copied from the order at write time, "" if none
	Status    string
	CreatedAt time.Time
}
