import { useEffect } from "react"
import {errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"

const CompanyErrorsHandler = () => {
    const dispatch = useDispatch()
    const getCompanyError = useSelector(selectReceivingError(errorKeys.get_company))

    useEffect(() => {
        if (!getCompanyError)
            return
        
        dispatch(handleErrorStandardWay(getCompanyError))
    }, [dispatch, getCompanyError])

    return (
        <></>
    )
}

export default CompanyErrorsHandler