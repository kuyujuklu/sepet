import { useEffect } from "react"
import { errorKeys, selectReceivingError, setStandardHandlingError  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys"
import { useCreateDishMutation, useDeleteDishMutation, useMoveDishLeftMutation, useMoveDishRightMutation, useUpdateDishMutation, useUploadDishImageMutation } from "@/app/admin/api/dish/dish"

const DishErrorsHandler = () => {
    const dispatch = useDispatch()
    const [, {error: dishCreateError }] = useCreateDishMutation({fixedCacheKey: fixedCacheKeys.dishes.create_dish})
    const [, {error: dishUpdateError }] = useUpdateDishMutation({fixedCacheKey: fixedCacheKeys.dishes.update_dish})
    const [, {error: dishDeleteError }] = useDeleteDishMutation({fixedCacheKey: fixedCacheKeys.dishes.delete_dish})
    const [, {error: dishUploadImageError }] = useUploadDishImageMutation({fixedCacheKey: fixedCacheKeys.dishes.upload_dish_image})
    const [, {error: dishMoveLeftError }] = useMoveDishLeftMutation({fixedCacheKey: fixedCacheKeys.dishes.move_dish_left})
    const [, {error: dishMoveRightError }] = useMoveDishRightMutation({fixedCacheKey: fixedCacheKeys.dishes.move_dish_right})
    const dishGetByIDError = useSelector(selectReceivingError(errorKeys.get_dish_by_id))
    const getDishesError = useSelector(selectReceivingError(errorKeys.get_dishes))

    useEffect(() => {
        if (!dishCreateError)
            return

        dispatch(setStandardHandlingError(dishCreateError))
    }, [dispatch, dishCreateError])
    
    useEffect(() => {
        if (!dishUpdateError)
            return

        dispatch(setStandardHandlingError(dishUpdateError))
    }, [dispatch, dishUpdateError])

    useEffect(() => {
        if (!dishDeleteError)
            return

        dispatch(setStandardHandlingError(dishDeleteError))
    }, [dispatch, dishDeleteError])

    useEffect(() => {
        if (!dishUploadImageError)
            return

        dispatch(setStandardHandlingError(dishUploadImageError))
    }, [dispatch, dishUploadImageError])
    
    useEffect(() => {
        if (!dishMoveLeftError)
            return

        dispatch(setStandardHandlingError(dishMoveLeftError))
    }, [dispatch, dishMoveLeftError])

    useEffect(() => {
        if (!dishMoveRightError)
            return

        dispatch(setStandardHandlingError(dishMoveRightError))
    }, [dispatch, dishMoveRightError])
    
    useEffect(() => {
        if (!dishGetByIDError|| dishGetByIDError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(dishGetByIDError))
    }, [dispatch, dishGetByIDError])
    
    useEffect(() => {
        if (!getDishesError || getDishesError.originalStatus === 404)
            return
        dispatch(setStandardHandlingError(getDishesError))
    }, [dispatch, getDishesError])
    

    return (
    <div></div>
  )
}

export default DishErrorsHandler