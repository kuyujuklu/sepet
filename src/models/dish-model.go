package models

import "gorm.io/gorm"

type Dish struct {
	gorm.Model
	Name          string
	ImageFileName string
	Price         float64
	SalePrice     float64
	Ingredients   string
	TextColor     string
	Place         int
	Visible       bool
	CategoryID    uint
	Category      Category

	// Available is the manual "в наличии" toggle. New rows default to
	// available in the DB (see gorm default tag), but existing rows from
	// before this column existed need a one-time backfill to true - see the
	// migration note in AutoMigrate.
	Available bool `gorm:"default:true"`
	IsHit     bool

	// AvailabilityStart/End are minutes-since-midnight, same convention as
	// Shipping's work-hours fields. AvailabilityStart == AvailabilityEnd
	// (including the zero value) means "no schedule set - always available",
	// since a real serving window can never be zero-width.
	AvailabilityStart int
	AvailabilityEnd   int

	ModifierGroups []ModifierGroup `gorm:"many2many:dish_modifier_groups;"`
}

// IsAvailableNow reports whether the dish can be ordered right now: the
// manual toggle must be on, and if a schedule window is set, the current
// time (in minutes-since-midnight local time) must fall inside it.
func (d *Dish) IsAvailableNow(nowMinutes int) bool {
	if !d.Available {
		return false
	}

	if d.AvailabilityStart == d.AvailabilityEnd {
		return true
	}

	return nowMinutes >= d.AvailabilityStart && nowMinutes <= d.AvailabilityEnd
}
