import { useEffect } from "react"
import { errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"

const OrderErrorsHandler = () => {
    const dispatch = useDispatch()
    const updateOrderStatusError = useSelector(selectReceivingError(errorKeys.update_order_status))

    useEffect(() => {
        if (!updateOrderStatusError || updateOrderStatusError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(updateOrderStatusError))
    }, [dispatch, updateOrderStatusError])

    return (
    <div></div>
  )
}

export default OrderErrorsHandler