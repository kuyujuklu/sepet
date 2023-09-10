package httphelpers

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
)

func CheckAccess(userID int, inputUserID int, userSignificance int) error {
	if userID != inputUserID && userSignificance > models.ADMIN_SIGNIFICANCE {
		fmt.Println("httperrors.ErrForbidden")
		return httperrors.ErrForbidden
	}

	return nil
}
