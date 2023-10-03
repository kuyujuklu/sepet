package httphelpers

import "github.com/alexkalak/qrmenu/src/models"

func IsAdmin(userSignificance int) bool {
	return userSignificance <= models.ADMIN_SIGNIFICANCE
}
