package httphelpers

import (
	"github.com/alexkalak/qrmenu/src/errors/httperrors"
	"github.com/alexkalak/qrmenu/src/models"
)

func CheckAccessForCompanyAction(userID int, companyID int, userSignificance int) error {
	if userSignificance < models.COMPANY_SIGNIFICANCE {
		return nil
	}

	if userID != companyID {
		return httperrors.ErrForbidden
	}

	return nil
}
