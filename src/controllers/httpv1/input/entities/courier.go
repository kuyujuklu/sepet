package entities

import (
	"fmt"
	"time"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type CreateCourierInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateCourierInput struct {
	FullName    string `json:"full_name"`
	PhoneNumber string `json:"phone_number"`
	BirthDate   string `json:"birth_date"`
	Gender      string `json:"gender"`
	Location    string `json:"location"`
}

func (c *UpdateCourierInput) ConvertToModel() (models.Courier, error) {
	fmt.Println("birth date: ", c.BirthDate)
	birthDate, err := time.Parse(helpers.ShortApiTimeFormat, c.BirthDate)
	if err != nil {
		return models.Courier{}, err
	}

	courier := models.Courier{
		FullName:    c.FullName,
		PhoneNumber: c.PhoneNumber,
		BirthDate:   birthDate,
		Gender:      c.Gender,
		Location:    c.Location,
	}

	return courier, nil
}

type CourierOutput struct {
	ID        int    `json:"id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`

	FullName      string `json:"full_name"`
	Email         string `json:"email"`
	PhoneNumber   string `json:"phone_number"`
	BirthDate     string `json:"birth_date"`
	Gender        string `json:"gender"`
	Location      string `json:"location"`
	ImageFileName string `json:"image_file_name"`
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

}

type ReserveOrderInput struct {
	OrderID int `json:"order_id"`
}

type SetOrderStatusInput struct {
	OrderID int `json:"order_id"`
}
