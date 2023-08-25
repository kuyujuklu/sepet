package puberrors

import "errors"

var ErrUnableToGetPub = errors.New("unable to get pub")

var ErrUnableToCreatePub = errors.New("unable to create pub")

var ErrUnableToUpdatePub = errors.New("unable to update pub")

var ErrUnableToDeletePub = errors.New("unable to delete pub")

var ErrPubNotFound = errors.New("pub not found")

var ErrPubURLNameAlreadyExists = errors.New("pub URL name already exists")

var ErrPubHasBadCompanyID = errors.New("pub has bad company ID")

var ErrPubHasNoLogo = errors.New("pub has no logo")

var ErrPubHasNoBG = errors.New("pub has no BG")
