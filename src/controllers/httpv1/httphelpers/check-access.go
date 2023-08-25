package httphelpers

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
)

func CheckAccess(userID int, inputUserID int, userSignificance int) error {
	fmt.Println("userID", userID)
	fmt.Println("inputUserID", inputUserID)
	fmt.Println("userSignificance", userSignificance)
	if userID != inputUserID && userSignificance > models.ADMIN_SIGNIFICANCE {
		fmt.Println("httperrors.ErrForbidden")
		return httperrors.ErrForbidden
	}

	return nil
}
