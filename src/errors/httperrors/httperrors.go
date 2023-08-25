package httperrors

import "errors"

var ErrBadID = errors.New("bad id")

var ErrBadBody = errors.New("bad body")

var ErrUnauthorized = errors.New("unauthorized")

var ErrForbidden = errors.New("forbidden")

var ErrBadDocument = errors.New("bad document")

var ErrInvalidFileExtension = errors.New("invalid file extension")
