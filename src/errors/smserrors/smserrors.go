package smserrors

import "errors"

var ErrUnableToSendSms = errors.New("unable to send sms")
var ErrInvalidVerificationCode = errors.New("invalid verfification code")
