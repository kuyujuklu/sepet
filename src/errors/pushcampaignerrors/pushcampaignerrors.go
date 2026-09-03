package pushcampaignerrors

import "errors"

var ErrPushCampaignNotFound = errors.New("push campaign not found")
var ErrUnableToGetPushCampaign = errors.New("unable to get push campaign")
var ErrUnableToCreatePushCampaign = errors.New("unable to create push campaign")
var ErrUnableToUpdatePushCampaign = errors.New("unable to update push campaign")
var ErrUnknownDeepLinkType = errors.New("unknown deep link type")
var ErrUnknownAudienceType = errors.New("unknown audience type")
var ErrPushCampaignAlreadySent = errors.New("push campaign was already sent")
var ErrNoRecipientsForAudience = errors.New("no recipients match this audience")
var ErrTestRecipientNotSubscribed = errors.New("this phone number has no active push subscription")
var ErrInvalidScheduledTime = errors.New("scheduled time must be in the future")
