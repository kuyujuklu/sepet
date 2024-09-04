package jwtservice

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

const (
	STANDARD_ACCESS_LIFE_TIME = time.Minute * 15    // 15 minutes
	ADMIN_ACCESS_LIFE_TIME    = time.Hour * 24 * 30 //month
)
const (
	STANDARD_REFRESH_LIFE_TIME = time.Hour * 24 * 30 * 6 //6 months
)

type UserClaims struct {
	ID           int    `json:"id"`
	Significance int    `json:"significance"`
	RoleName     string `json:"role_name"`
	jwt.RegisteredClaims
}
