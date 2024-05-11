import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  errorKeys,
  handleErrorStandard,
  pushError,
  selectError,
} from "../errorHandlingSlice";
import { appErrors } from "../../../../app/errors/appErrors";
import { authApiErrors } from "../../../../shared/api/apiErrors/authApiErrors";

const AuthErrorHandler = () => {
  const dispatch = useDispatch();
  const registrationDataError = useSelector(
    selectError(errorKeys.registration),
  );

  const authenticationDataError = useSelector(
    selectError(errorKeys.authentication),
  );

  useEffect(() => {
    if (!registrationDataError) return;

    const appError = { text: appErrors.something_went_wrong };
    if (registrationDataError === authApiErrors.too_many_login_sessions) {
      appError.text = appErrors.too_many_session_requests;
    }
    if (
      registrationDataError ===
      authApiErrors.client_with_the_same_number_already_exists
    ) {
      appError.text = appErrors.client_with_the_same_phone_already_exists;
    }

    dispatch(handleErrorStandard(appError));
    dispatch(pushError({ errorKey: errorKeys.registration, error: null }));
  }, [registrationDataError]);

  useEffect(() => {
    if (!authenticationDataError) return;

    let appError = { text: appErrors.something_went_wrong };
    if (authenticationDataError === authApiErrors.client_not_found) {
      appError.text = appErrors.client_not_found;
    }
    if (authenticationDataError === authApiErrors.invalid_password) {
      appError.text = appErrors.invalidPassword;
    }

    dispatch(handleErrorStandard(appError));
    dispatch(pushError({ errorKey: errorKeys.authentication, error: null }));
  }, [authenticationDataError]);

  return <></>;
};

export default AuthErrorHandler;
