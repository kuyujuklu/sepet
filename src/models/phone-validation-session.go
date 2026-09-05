package models

import "gorm.io/gorm"

const (
	SMS_PROVIDER_TWILIO  = "twilio"
	SMS_PROVIDER_INFOBIP = "infobip"
)

type PhoneValidationSession struct {
	gorm.Model
	Name           string
	Phone          string
	HashedPassword string
	Number         string
	PinID          string
	// Provider is whichever of smsservice's providers actually created
	// PinID (SMS_PROVIDER_TWILIO/SMS_PROVIDER_INFOBIP) - checking the code
	// has to go back to the same one, since a PinID from one means nothing
	// to the other's API. Empty for a session created before InfoBip
	// fallback existed; smsservice treats empty as Twilio (it was the only
	// provider then).
	Provider string
}
