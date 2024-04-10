package clienterrors

import "errors"

var ErrUnableToGetClient = errors.New("unable to get client")
var ErrUnableToCreateClient = errors.New("unable to create client")
var ErrUnableToUpdateClient = errors.New("unable to update client")
var ErrUnableToDeleteClient = errors.New("unable to delete client")
var ErrUnableToCreateSession = errors.New("unable to create session")
var ErrClientNotFound = errors.New("client not found")
var ErrClientWithTheSameNumberAlreadyExists = errors.New("client with the same number already exists")
var ErrUnableToGetSession = errors.New("unable to get session")
var ErrTooManyLoginSessions = errors.New("too many login sessions")
var ErrInvalidValidationNumber = errors.New("invalid validation number")

var ErrInvalidLatitude = errors.New("invalid latitude")
var ErrInvalidLongitude = errors.New("invalid longitude")
