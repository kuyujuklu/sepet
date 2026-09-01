package shippingcopypreseterrors

import "errors"

var ErrShippingCopyPresetNotFound = errors.New("shipping copy preset not found")

var ErrUnableToGetShippingCopyPreset = errors.New("unable to get shipping copy preset")

var ErrUnableToCreateShippingCopyPreset = errors.New("unable to create shipping copy preset")

var ErrUnableToUpdateShippingCopyPreset = errors.New("unable to update shipping copy preset")

var ErrUnableToDeleteShippingCopyPreset = errors.New("unable to delete shipping copy preset")
