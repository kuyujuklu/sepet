package entities

import (
	"fmt"
	"time"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type CreateCourierInput struct {
	Email    string `json:"email" validate:"required,email" example:"courier@example.com"`
	Password string `json:"password" validate:"required,min=8" example:"securepassword"`
}

type CourierNotificationSubscriptionInput struct {
	Token string `json:"token" validate:"required" example:"ExpoNotification[xxxxx]"`
	Lang  string `json:"lang" example:"ru"`
}

type UpdateCourierInput struct {
	FullName         string `json:"full_name"`
	PhoneNumber      string `json:"phone_number"`
	BirthDate        string `json:"birth_date"`
	Gender           string `json:"gender"`
	Location         string `json:"location"`
	TelegramUsername string `json:"telegram_username"`
}

func (c *UpdateCourierInput) ConvertToModel() (models.Courier, error) {
	fmt.Println("birth date: ", c.BirthDate)
	birthDate, err := time.Parse(helpers.ShortApiTimeFormat, c.BirthDate)
	if err != nil {
		return models.Courier{}, err
	}

	courier := models.Courier{
		FullName:         c.FullName,
		PhoneNumber:      c.PhoneNumber,
		BirthDate:        birthDate,
		Gender:           c.Gender,
		Location:         c.Location,
		TelegramUsername: c.TelegramUsername,
	}

	return courier, nil
}

type CourierOutput struct {
	ID        int    `json:"id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`

	FullName         string  `json:"full_name"`
	Email            string  `json:"email"`
	PhoneNumber      string  `json:"phone_number"`
	BirthDate        string  `json:"birth_date"`
	Gender           string  `json:"gender"`
	Location         string  `json:"location"`
	ImageFileName    string  `json:"image_file_name"`
	TelegramUsername string  `json:"telegram_username"`
	Balance          float64 `json:"balance"`
}

func (c *CourierOutput) FillFromModel(courier models.Courier) {
	c.ID = int(courier.ID)
	c.CreatedAt = helpers.ConvertToStandardApiTime(courier.CreatedAt)
	c.UpdatedAt = helpers.ConvertToStandardApiTime(courier.UpdatedAt)
	c.FullName = courier.FullName
	c.ImageFileName = courier.ImageFileName
	c.Email = courier.Email
	c.PhoneNumber = courier.PhoneNumber
	c.BirthDate = helpers.ConvertToShortApiTime(courier.BirthDate)
	c.Gender = courier.Gender
	c.Location = courier.Location
	c.TelegramUsername = courier.TelegramUsername
	c.Balance = courier.Balance
}

type ReserveOrderInput struct {
	OrderID int `json:"order_id"`
}

type SetOrderStatusInput struct {
	OrderID int `json:"order_id"`
}
