package infobipentities

type CreateApplicationBody struct {
	Name          string                        `json:"name"`
	Configuration ApplicationConfigurationInput `json:"configuration"`
}

type ApplicationConfigurationInput struct {
	PinAttempts                  string `json:"pinAttempts"`
	AllowMultiplePinVerification bool   `json:"allowMultiplePinVerifications"`
	PinTimeToLive                string `json:"pinTimeToLive"`
	VerifyPinLimit               string `json:"verifyPinLimit"`
	SendPinPerApplicationLimit   string `json:"sendPinPerApplicationLimit"`
	SendPinPerPhoneNumberLimit   string `json:"sendPinPerPhoneNumberLimit"`
}

type CreateApplicationResponse struct {
	ApplicationID string                           `json:"applicationId"`
	Name          string                           `json:"name"`
	Configuration ApplicationConfigurationResponse `json:"configuration"`
}

type ApplicationConfigurationResponse struct {
	PinAttempts                  string `json:"pinAttempts"`
	AllowMultiplePinVerification bool   `json:"allowMultiplePinVerifications"`
	PinTimeToLive                string `json:"pinTimeToLive"`
	VerifyPinLimit               string `json:"verifyPinLimit"`
	SendPinPerApplicationLimit   string `json:"sendPinPerApplicationLimit"`
	SendPinPerPhoneNumberLimit   string `json:"sendPinPerPhoneNumberLimit"`
}

type CreateMessageBody struct {
	PinType     string `json:"pinType"`     //"NUMERIC"
	MessageText string `json:"messageText"` //"Your pin is {{pin}}"
	PinLength   int    `json:"pinLength"`   // 6
	SenderId    string `json:"ServiceSMS"`  // SANDEXMD
}
type CreateMessageResponse struct {
	MessageID      string `json:"messageId"`      //"F51F7A562C1EAEF21F618027CAF1B4CD"
	ApplicationID  string `json:"applicationId"`  //"643FF914EA065EDD0370EBF5563183E8"
	PinPlaceholder string `json:"pinPlaceholder"` //"{{pin}}"
	MessageText    string `json:"messageText"`    //"Your pin is {{pin}}"
	PinLength      int    `json:"pinLength"`      // 6,
	PinType        string `json:"pinType"`        //"NUMERIC"
	SenderID       string `json:"senderId"`       // SandexMD
	SpeechRate     string `json:"speechRate"`     //:1.0
}

type DeliverMessageBody struct {
	ApplicationID string `json:"applicationId"` //"643FF914EA065EDD0370EBF5563183E8",
	MessageID     string `json:"messageId"`     // F51F7A562C1EAEF21F618027CAF1B4CD",
	From          string `json:"from"`          //"447491163443"
	To            string `json:"to"`            //"37367507188"
}
type DeliverMessageResponse struct {
	PinID     string `json:"pinId"`     //"689C05F7F91D289DE6732FF9044EA454"
	To        string `json:"to"`        //"37367507188"
	NcStatus  string `json:"ncStatus"`  //"NC_NOT_CONFIGURED"
	SmsStatus string `json:"smsStatus"` // MESSAGE_SENT
}

type VerifyMessageBody struct {
	Pin string `json:"pin"`
}

type VerifyMessageResponse struct {
	PinID             string `json:"pinId"`
	Msisdn            string `json:"msisdn"`
	Verified          bool   `json:"verified"`
	AttemptsRemaining int    `json:"attemptsRemaining"`
}
