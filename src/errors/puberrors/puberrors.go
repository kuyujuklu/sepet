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

var ErrUnableToCreateQrCode = errors.New("unable to create QR code")

var ErrPubShippingIsInvalid = errors.New("pub shipping is invalid")

var ErrPubPreorderIsInvalid = errors.New("pub preorder is invalid")

var ErrUnableToAddCourier = errors.New("unable to add courier")

var ErrUnableToDeleteCourierFromPub = errors.New("unable to delete courier from pub")

var ErrUnableToUpdateDeliveryType = errors.New("unable to update delivery type")

var ErrUnableToUpdateAddCommissionToDishPrices = errors.New("unable to update add commission to dish prices")
