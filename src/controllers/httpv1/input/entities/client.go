package entities

import (
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type ClientAuthorizeInput struct {
	AccessToken string `json:"access_token"`
}

type RegistrateClientInput struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type CheckPhoneValidationNumberInput struct {
	Phone  string `json:"phone"`
	Number string `json:"number"`
}
type RegistrateBySessionNumberInput struct {
	Phone  string `json:"phone"`
	Number string `json:"number"`
}
type ChangePasswordBySessionNumberInput struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Number   string `json:"number"`
}

type AuthenticateClientInput struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type ClientOutput struct {
	CreatedAt string `json:"created_at" example:"2006-01-22"`
	Phone     string `json:"phone" example:"37367507188"`
	Name      string `json:"name" example:"Vladimir Zhirinovskiy"`
}

type NotificationSubscriptionInput struct {
	// Phone is empty for a client who hasn't logged in yet - subscribing
	// still has to work then, so this is intentionally not required.
	Phone string `json:"phone" example:"12312312"`
	// DeviceID is a UUID the app generates once and persists locally,
	// stable across logins/logouts on that install - what makes it possible
	// to link a phone to an already-subscribed anonymous device later
	// instead of creating a second row for it. Empty from an app build that
	// predates this field.
	DeviceID string `json:"device_id" example:"3fa3caf6-..."`
	Token    string `json:"token" example:"ExpoNotification[xxxxx]"`
	Lang     string `json:"lang" example:"ru"`
}

func (o *ClientOutput) FillFromModel(client models.Client) {
	o.CreatedAt = helpers.ConvertToStandardApiTime(client.CreatedAt)
	o.Phone = client.Phone
	o.Name = client.Name
}
