package jwterrors

import "errors"

var ErrNotValidSignature = errors.New("not valid signature")

var ErrTokenExpired = errors.New("token expired")

var ErrNotValidToken = errors.New("not valid token")

var ErrEmptyAccessToken = errors.New("empty access token")

var ErrEmptyRefreshToken = errors.New("empty access token")
