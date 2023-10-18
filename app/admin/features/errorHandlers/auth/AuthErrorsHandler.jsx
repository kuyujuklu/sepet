import { useEffect } from "react"
import {errorKeys, selectReceivingError, setReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { pushAlert } from "../../alerts/alertSlice"
import { appErrors } from "@/app/admin/errors/errors"
import { useTranslation } from "react-i18next"

const AuthErrorsHandler = () => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const authenticateError = useSelector(selectReceivingError(errorKeys.authentication))
    const registrationError = useSelector(selectReceivingError(errorKeys.registration))
    const logoutError = useSelector(selectReceivingError(errorKeys.logout))

    useEffect(() => {
        if (!authenticateError)
            return
        if(authenticateError.originalStatus === 404 || authenticateError.status === 404) {
            dispatch(setReceivingError({errorKey: errorKeys.authentication, error: null}))
            dispatch(pushAlert({type: 'danger', message: t(appErrors.something_went_wrong), delay: 3000}))
        }
        if(authenticateError.text === appErrors.invalidCredentials) {
            dispatch(setReceivingError({errorKey: errorKeys.authentication, error: null}))
            dispatch(pushAlert({type: 'danger', message: t(appErrors.invalidCredentials), delay: 3000}))
        }

    }, [dispatch, authenticateError, t])

    useEffect(() => {
        if (!registrationError)
            return

        dispatch(handleErrorStandardWay(registrationError))
    }, [dispatch, registrationError])


    useEffect(() => {
        if (!logoutError)
            return

        dispatch(handleErrorStandardWay(logoutError))
    }, [dispatch, logoutError])

    return (
        <></>
    )
}

export default AuthErrorsHandler