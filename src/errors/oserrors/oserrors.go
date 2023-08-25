package oserrors

import "errors"

var ErrUnableToSaveFile = errors.New("unable to save file")
var ErrUnableToOpenFile = errors.New("unable to open file")
var ErrUnableToDeleteFile = errors.New("unable to delete file")

var ErrUnableToCreateDir = errors.New("unable to create dir")
