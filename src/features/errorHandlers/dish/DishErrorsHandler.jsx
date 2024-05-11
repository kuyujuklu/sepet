import { useEffect } from "react"
import { errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/api/fixedCacheKeys"
import { useCreateDishMutation, useDeleteDishMutation, useMoveDishLeftMutation, useMoveDishRightMutation, useUpdateDishMutation, useUploadDishImageMutation } from "@/api/dish/dish"
import { appErrors } from "@/errors/errors"

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

        dispatch(handleErrorStandardWay(dishCreateError))
    }, [dispatch, dishCreateError])
    
    useEffect(() => {
        if (!dishUpdateError)
            return

        dispatch(handleErrorStandardWay(dishUpdateError))
    }, [dispatch, dishUpdateError])

    useEffect(() => {
        if (!dishDeleteError)
            return

        dispatch(handleErrorStandardWay(dishDeleteError))
    }, [dispatch, dishDeleteError])

    useEffect(() => {
        if (!dishUploadImageError)
            return

        let newErr = {...dishUploadImageError}

        if(dishUploadImageError.text === appErrors.invalidFileExtension) {
            newErr.text = appErrors.fileIsNotAnImage
        }

        dispatch(handleErrorStandardWay(newErr))
    }, [dispatch, dishUploadImageError])
    
    useEffect(() => {
        if (!dishMoveLeftError)
            return

        dispatch(handleErrorStandardWay(dishMoveLeftError))
    }, [dispatch, dishMoveLeftError])

    useEffect(() => {
        if (!dishMoveRightError)
            return

        dispatch(handleErrorStandardWay(dishMoveRightError))
    }, [dispatch, dishMoveRightError])
    
    useEffect(() => {
        if (!dishGetByIDError|| dishGetByIDError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(dishGetByIDError))
    }, [dispatch, dishGetByIDError])
    
    useEffect(() => {
        if (!getDishesError || getDishesError.originalStatus === 404)
            return
        dispatch(handleErrorStandardWay(getDishesError))
    }, [dispatch, getDishesError])
    

    return (
    <div></div>
  )
}

export default DishErrorsHandler