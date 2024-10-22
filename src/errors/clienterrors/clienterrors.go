package clienterrors

import "errors"

var ErrUnableToGetClient = errors.New("unable to get client")
var ErrUnableToCreateClient = errors.New("unable to create client")
var ErrUnableToUpdateClient = errors.New("unable to update client")
var ErrUnableToDeleteClient = errors.New("unable to delete client")
var ErrClientNotFound = errors.New("client not found")
var ErrClientWithTheSameNumberAlreadyExists = errors.New("client with the same number already exists")
var ErrClientInvalidPassword = errors.New("invalid password")

var ErrInvalidLatitude = errors.New("invalid latitude")
var ErrInvalidLongitude = errors.New("invalid longitude")

var ErrUnableToGetClientPhoneValidationSessions = errors.New("unable to get client validation sessions")
var ErrUnableToCreateClientPhoneValidationSession = errors.New("unable to create client validation session")
var ErrTooManySessions = errors.New("too many sessions")
var ErrPhoneValidationSessionHasExpired = errors.New("phone vaildation session has expired")
var ErrPhoneValidationSessionNotFound = errors.New("session not found")
var ErrPhoneValidationSessionNumberInvalid = errors.New("invalid phone validation session number")
var ErrUnableToChangePassword = errors.New("unable to change password")
