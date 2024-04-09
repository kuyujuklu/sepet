import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { errorKeys, handleErrorStandard, pushError, selectError } from '../errorHandlingSlice'
import { appErrors } from '../../../../app/errors/appErrors'
import { authApiErrors } from '../../../../shared/api/apiErrors/authApiErrors'

const AuthErrorHandler = () => {
    const dispatch = useDispatch()
    const registrationDataError = useSelector(selectError(errorKeys.registrationData))
    const registrationValidationError = useSelector(selectError(errorKeys.registrationValidation))
    
    const authenticationDataError = useSelector(selectError(errorKeys.authenticationData))
    const authenticationValidationError = useSelector(selectError(errorKeys.authenticationValidation))
    
    
    useEffect(() => {
        if(!registrationDataError) return;

        let appError = {text: appErrors.something_went_wrong};
        if(registrationDataError === authApiErrors.too_many_login_sessions) {
            appError.text = appErrors.too_many_session_requests
        }
        if(registrationDataError === authApiErrors.client_with_the_same_number_already_exists) {
            appError.text = appErrors.client_with_the_same_phone_already_exists
        }

        dispatch(handleErrorStandard(appError))
        dispatch(pushError({errorKey: errorKeys.registrationData, error: null}))
    }, [registrationDataError])

    useEffect(() => {
        if(!registrationValidationError) return;

        let appError = {text: appErrors.something_went_wrong};
        if(registrationValidationError === authApiErrors.invalid_validation_number) {
            appError.text = appErrors.validation_number_is_invalid_please_check_its_correctness
        }
        if(registrationDataError === authApiErrors.client_with_the_same_number_already_exists) {
            appError.text = appErrors.client_with_the_same_phone_already_exists
        }

        dispatch(handleErrorStandard(appError))
        dispatch(pushError({errorKey: errorKeys.registrationValidation, error: null}))
    }, [registrationValidationError])

    
    useEffect(() => {
        if(!authenticationDataError) return;

        let appError = {text: appErrors.something_went_wrong};
        if(authenticationDataError === authApiErrors.too_many_login_sessions) {
            appError.text = appErrors.too_many_session_requests
        }
        if(authenticationDataError === authApiErrors.client_not_found) {
            appError.text = appErrors.client_not_found
        }

        dispatch(handleErrorStandard(appError))
        dispatch(pushError({errorKey: errorKeys.authenticationData, error: null}))
    }, [authenticationDataError])

    useEffect(() => {
        if(!authenticationValidationError) return;

        let appError = {text: appErrors.something_went_wrong};
        if(authenticationValidationError === authApiErrors.invalid_validation_number) {
            appError.text = appErrors.validation_number_is_invalid_please_check_its_correctness
        }
        if(registrationDataError === authApiErrors.client_with_the_same_number_already_exists) {
            appError.text = appErrors.client_not_found
        }

        dispatch(handleErrorStandard(appError))
        dispatch(pushError({errorKey: errorKeys.authenticationValidation, error: null}))
    }, [authenticationValidationError])

  return (
    <></>
  )
}

export default AuthErrorHandler