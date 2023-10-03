package adminerrors

import "errors"

var ErrAdminNotFound = errors.New("admin not found")
var ErrAdminIncorrectPassword = errors.New("incorrect password")
