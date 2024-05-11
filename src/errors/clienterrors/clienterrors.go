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
