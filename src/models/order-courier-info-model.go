package models

import "gorm.io/gorm"

type OrderCourierInfo struct {
	gorm.Model

	IsReserved            bool
	ReserverCourierID     int
	Distance              int
	CourierReward         float64
	CourierDebit          float64
	IsDebitAddedToCourier bool
}
