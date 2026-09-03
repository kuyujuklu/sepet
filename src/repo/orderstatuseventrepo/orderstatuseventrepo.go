package orderstatuseventrepo

import (
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type AveragePreparingDuration struct {
	AvgMinutes  float64
	SampleCount int
}

type OrderStatusEventRepo interface {
	CreateEventWithinTransaction(tx *gorm.DB, event models.OrderStatusEvent) error
	GetEventsForOrder(orderID int) ([]models.OrderStatusEvent, error)
	// Average minutes between a "preparing" event and the following
	// "at_courier" event for the same order, over the most recent `limit`
	// orders that reached both - this is what "how long until ready" is
	// measured as (see the comment on OrderStatusEvent). shapeID == ""
	// means pub-wide (no zone filter), used as the fallback when a zone
	// doesn't have enough history of its own yet.
	GetAveragePreparingToCourierMinutes(pubID int, shapeID string, limit int) (AveragePreparingDuration, error)
}

type orderStatusEventRepo struct {
	Database *gorm.DB
}

func New() OrderStatusEventRepo {
	return &orderStatusEventRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *orderStatusEventRepo) CreateEventWithinTransaction(tx *gorm.DB, event models.OrderStatusEvent) error {
	result := tx.Create(&event)
	if result.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}

func (r *orderStatusEventRepo) GetEventsForOrder(orderID int) ([]models.OrderStatusEvent, error) {
	events := make([]models.OrderStatusEvent, 0)
	result := r.Database.
		Where("order_id = ?", orderID).
		Order("created_at asc").
		Find(&events)
	if result.Error != nil {
		return nil, servererrors.ErrInternalServerError
	}

	return events, nil
}

func (r *orderStatusEventRepo) GetAveragePreparingToCourierMinutes(pubID int, shapeID string, limit int) (AveragePreparingDuration, error) {
	shapeFilter := ""
	args := []interface{}{pubID, models.PREPARING_ORDER_STATUS}
	if shapeID != "" {
		shapeFilter = "AND shape_id = ?"
		args = append(args, shapeID)
	}
	args = append(args, pubID, models.AT_COURIER_ORDER_STATUS, limit)

	query := `
		WITH preparing_events AS (
			SELECT order_id, MIN(created_at) as preparing_at
			FROM order_status_events
			WHERE pub_id = ? AND status = ? ` + shapeFilter + `
			GROUP BY order_id
		),
		courier_events AS (
			SELECT order_id, MIN(created_at) as courier_at
			FROM order_status_events
			WHERE pub_id = ? AND status = ?
			GROUP BY order_id
		),
		recent AS (
			SELECT p.preparing_at, c.courier_at
			FROM preparing_events p
			JOIN courier_events c ON c.order_id = p.order_id
			WHERE c.courier_at > p.preparing_at
			ORDER BY p.preparing_at DESC
			LIMIT ?
		)
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (courier_at - preparing_at)) / 60), 0) as avg_minutes,
		       COUNT(*) as sample_count
		FROM recent
	`

	var result AveragePreparingDuration
	err := r.Database.Raw(query, args...).Scan(&result).Error
	if err != nil {
		return AveragePreparingDuration{}, servererrors.ErrInternalServerError
	}

	return result, nil
}
