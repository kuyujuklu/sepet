import { useDispatch, useSelector } from "react-redux"
import { useReserveOrderMutation, useSetOrderStatusToCanceledMutation, useSetOrderStatusToCompletedMutation, useUpdateCourierMutation, useUploadCourierImageMutation } from "../../../api/courier/courier"
import { fixedCacheKeys } from "../../../api/fixedCacheKeys"
import { errorKeys, handleErrorStandardWay, selectReceivingError } from "../errorHandlerSlice"
import { useEffect } from "react"
import { appErrors } from "../../../errors/errors"
import { requireAuthentication } from "../../auth/authSlice"

const CourierErrorHandlers = () => {
    const dispatch = useDispatch()

    const [, {error: uploadCourierImageError }] = useUploadCourierImageMutation({fixedCacheKey: fixedCacheKeys.courier.update_courier_image})
    const [, {error: updateCourierError }] = useUpdateCourierMutation({fixedCacheKey: fixedCacheKeys.courier.update_courier_info})
    const [, {error: reserveOrderError }] = useReserveOrderMutation({fixedCacheKey: fixedCacheKeys.courier.reserve_order})
    const [, {error: setOrderToCompleted }] = useSetOrderStatusToCompletedMutation({fixedCacheKey: fixedCacheKeys.courier.set_order_to_completed})
    const [, {error: setOrderToCanceled }] = useSetOrderStatusToCanceledMutation({fixedCacheKey: fixedCacheKeys.courier.set_order_to_canceled})
    const getCourierInfoError = useSelector(selectReceivingError(errorKeys.get_courier_info))

    useEffect(() => {
        if (!uploadCourierImageError)
            return


        let newErr = {...uploadCourierImageError}

        if(uploadCourierImageError.text === appErrors.invalidFileExtension) {
            newErr.text = appErrors.fileIsNotAnImage
        }

        dispatch(handleErrorStandardWay(uploadCourierImageError))
    }, [dispatch, uploadCourierImageError])
    
    useEffect(() => {
        if (!updateCourierError)
            return

        dispatch(handleErrorStandardWay(updateCourierError))
    }, [dispatch, updateCourierError])
    
    useEffect(() => {
        if(!getCourierInfoError) return;
        console.log("GET COURIER ERROR: ", getCourierInfoError)
        if (getCourierInfoError?.data?.err === "courier not found") {
			dispatch(requireAuthentication())
            return
        } 

        dispatch(handleErrorStandardWay(getCourierInfoError))
    }, [dispatch, getCourierInfoError])

    useEffect(() => {
        if (!reserveOrderError)
            return

        dispatch(handleErrorStandardWay(reserveOrderError))
    }, [dispatch, reserveOrderError])


    useEffect(() => {
        if (!setOrderToCompleted)
            return

        dispatch(handleErrorStandardWay(setOrderToCompleted))
    }, [dispatch, setOrderToCompleted])
    useEffect(() => {
        if (!setOrderToCanceled)
            return

        dispatch(handleErrorStandardWay(setOrderToCanceled))
    }, [dispatch, setOrderToCanceled])


    return (
    <></>
)
}

export default CourierErrorHandlers
