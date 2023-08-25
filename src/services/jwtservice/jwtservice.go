package jwtservice

import (
	"os"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
)

type JwtService interface {
	GetAccessTokenString(id int, userSignificance int, lifeTime time.Duration) (string, error)
	GetRefreshTokenString(id int, userSignificance int, lifeTime time.Duration) (string, error)
	ParseJwtTokenString(tokenString string) (*UserClaims, bool, error)
}

type jwtService struct {
	Key []byte
}

func New() JwtService {
	godotenv.Load()
	keyString := os.Getenv("JWT_SECRET")
	return &jwtService{
		Key: []byte(keyString),
	}
}

func (s *jwtService) GetAccessTokenString(id int, userSignificance int, lifeTime time.Duration) (string, error) {
	expirationTime := time.Now().Add(lifeTime)

	claims := UserClaims{
		ID:           id,
		Significance: userSignificance,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "access",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.Key)

	if err != nil {
		return "", jwterrors.ErrNotValidSignature
	}

	return tokenString, nil
}

func (s *jwtService) GetRefreshTokenString(id int, userSignificance int, lifeTime time.Duration) (string, error) {
	expirationTime := time.Now().Add(lifeTime)

	claims := UserClaims{
		ID:           id,
		Significance: userSignificance,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.Key)

	if err != nil {
		return "", jwterrors.ErrNotValidToken
	}

	return tokenString, nil
}

func (s *jwtService) ParseJwtTokenString(tokenString string) (*UserClaims, bool, error) {
	claims := UserClaims{}

	token, err := jwt.ParseWithClaims(tokenString, &claims, func(t *jwt.Token) (interface{}, error) {
		return s.Key, nil
	})

	if err != nil {
		switch err {
		case jwt.ErrTokenExpired:
			return nil, false, jwterrors.ErrTokenExpired
		case jwt.ErrSignatureInvalid:
			return nil, false, jwterrors.ErrNotValidSignature
		default:
			return nil, false, jwterrors.ErrNotValidToken
		}
	}

	if !token.Valid {
		return nil, false, jwterrors.ErrNotValidToken
	}

	return &claims, true, nil
}
