import { useEffect } from "react"
import { errorKeys, selectReceivingError, setStandardHandlingError  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys"
import { useCreateCategoryMutation, useDeleteCategoryMutation, useMoveCategoryLeftMutation, useMoveCategoryRightMutation, useUpdateCategoryMutation, useUploadCategoryImageMutation } from "@/app/admin/api/categories/category"

const CategoryErrorsHandler = () => {
    const dispatch = useDispatch()
    const [, {error: categoryCreateError }] = useCreateCategoryMutation({fixedCacheKey: fixedCacheKeys.categories.create_category})
    const [, {error: categoryUpdateError }] = useUpdateCategoryMutation({fixedCacheKey: fixedCacheKeys.categories.update_category})
    const [, {error: categoryDeleteError }] = useDeleteCategoryMutation({fixedCacheKey: fixedCacheKeys.categories.delete_category})
    const [, {error: categoryUploadImageError }] = useUploadCategoryImageMutation({fixedCacheKey: fixedCacheKeys.categories.upload_category_image})
    const [, {error: categoryMoveLeftError }] = useMoveCategoryLeftMutation({fixedCacheKey: fixedCacheKeys.categories.move_category_left})
    const [, {error: categoryMoveRightError }] = useMoveCategoryRightMutation({fixedCacheKey: fixedCacheKeys.categories.move_category_right})
    const categoryGetByIDError = useSelector(selectReceivingError(errorKeys.get_category_by_id))
    const getCategoriesError = useSelector(selectReceivingError(errorKeys.get_categories))

    useEffect(() => {
        if (!categoryCreateError)
            return

        dispatch(setStandardHandlingError(categoryCreateError))
    }, [dispatch, categoryCreateError])
    
    useEffect(() => {
        if (!categoryUpdateError)
            return

        dispatch(setStandardHandlingError(categoryUpdateError))
    }, [dispatch, categoryUpdateError])

    useEffect(() => {
        if (!categoryDeleteError)
            return

        dispatch(setStandardHandlingError(categoryDeleteError))
    }, [dispatch, categoryDeleteError])

    useEffect(() => {
        if (!categoryUploadImageError)
            return

        dispatch(setStandardHandlingError(categoryUploadImageError))
    }, [dispatch, categoryUploadImageError])
    
    useEffect(() => {
        if (!categoryMoveLeftError)
            return

        dispatch(setStandardHandlingError(categoryMoveLeftError))
    }, [dispatch, categoryMoveLeftError])

    useEffect(() => {
        if (!categoryMoveRightError)
            return

        dispatch(setStandardHandlingError(categoryMoveRightError))
    }, [dispatch, categoryMoveRightError])
    
    useEffect(() => {
        if (!categoryGetByIDError|| categoryGetByIDError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(categoryGetByIDError))
    }, [dispatch, categoryGetByIDError])
    
    useEffect(() => {
        if (!getCategoriesError || getCategoriesError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(getCategoriesError))
    }, [dispatch, getCategoriesError])
    

    return (
    <div></div>
  )
}

export default CategoryErrorsHandler