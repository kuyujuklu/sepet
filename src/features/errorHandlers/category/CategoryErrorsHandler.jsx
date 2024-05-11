import { useEffect } from "react"
import { errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/api/fixedCacheKeys"
import { useCreateCategoryMutation, useDeleteCategoryMutation, useMoveCategoryLeftMutation, useMoveCategoryRightMutation, useUpdateCategoryMutation, useUploadCategoryImageMutation } from "@/api/categories/category"
import { appErrors } from "@/errors/errors"

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

        dispatch(handleErrorStandardWay(categoryCreateError))
    }, [dispatch, categoryCreateError])
    
    useEffect(() => {
        if (!categoryUpdateError)
            return

        dispatch(handleErrorStandardWay(categoryUpdateError))
    }, [dispatch, categoryUpdateError])

    useEffect(() => {
        if (!categoryDeleteError)
            return

        dispatch(handleErrorStandardWay(categoryDeleteError))
    }, [dispatch, categoryDeleteError])

    useEffect(() => {
        if (!categoryUploadImageError)
            return


        let newErr = {...categoryUploadImageError}

        if(categoryUploadImageError.text === appErrors.invalidFileExtension) {
            newErr.text = appErrors.fileIsNotAnImage
        }
    
        dispatch(handleErrorStandardWay(newErr))
    }, [dispatch, categoryUploadImageError])
    
    useEffect(() => {
        if (!categoryMoveLeftError)
            return

        dispatch(handleErrorStandardWay(categoryMoveLeftError))
    }, [dispatch, categoryMoveLeftError])

    useEffect(() => {
        if (!categoryMoveRightError)
            return

        dispatch(handleErrorStandardWay(categoryMoveRightError))
    }, [dispatch, categoryMoveRightError])
    
    useEffect(() => {
        if (!categoryGetByIDError|| categoryGetByIDError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(categoryGetByIDError))
    }, [dispatch, categoryGetByIDError])
    
    useEffect(() => {
        if (!getCategoriesError || getCategoriesError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(getCategoriesError))
    }, [dispatch, getCategoriesError])
    

    return (
    <div></div>
  )
}

export default CategoryErrorsHandler