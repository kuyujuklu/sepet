import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { errorKeys, handleErrorStandard, pushError, selectError } from '../errorHandlingSlice'
import { appErrors } from '../../../../app/errors/appErrors'
import { setIsRequiringAuthentication } from '../../auth/authSlice'

const OrdersErrorHandler = () => {
    const dispatch = useDispatch()
    const getClientError = useSelector(selectError(errorKeys.createOrderError))

    useEffect(() => {
        if(!getClientError) return;

        if(getClientError.unauthorized) {
            dispatch(setIsRequiringAuthentication(true))
            return
        }

        let appError = {text: appErrors.something_went_wrong};

        dispatch(handleErrorStandard(appError))
        dispatch(pushError({errorKey: errorKeys.createOrderError, error: null}))
    }, [getClientError])

  return (
    <></>
  )
}

export default OrdersErrorHandler