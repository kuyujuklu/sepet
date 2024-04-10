package entities

import (
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type ClientAuthorizeInput struct {
	AccessToken string `json:"access_token"`
}

type CreateRegistrationSessionInput struct {
	Phone string `json:"phone" validate:"number" example:"37367507188"`
	Name  string `json:"name" validate:"required" example:"Vladimir Zhirinovskiy"`
}

type CreateAuthenticationSessionInput struct {
	Phone string `json:"phone" validate:"number" example:"37367507188"`
}

type ValidateSessionInput struct {
	Phone            string `json:"phone" validate:"number" example:"37367507188"`
	ValidationNumber int    `json:"validation_number" validate:"number" example:"123456"`
}

type ClientOutput struct {
	CreatedAt string `json:"created_at" example:"2006-01-22"`
	Phone     string `json:"phone" example:"37367507188"`
	Name      string `json:"name" example:"Vladimir Zhirinovskiy"`
}

func (o *ClientOutput) FillFromModel(client models.Client) {
	o.CreatedAt = helpers.ConvertToStandardApiTime(client.CreatedAt)
	o.Phone = client.Phone
	o.Name = client.Name
}
