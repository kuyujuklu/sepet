import { useEffect } from "react"
import { errorKeys, selectReceivingError, setStandardHandlingError  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys"
import { useCreateMenuMutation, useDeleteMenuMutation, useMoveMenuLeftMutation, useMoveMenuRightMutation, useUpdateMenuMutation } from "@/app/admin/api/menu/menu"

const MenuErrorsHandler = () => {
    const dispatch = useDispatch()
    const [, {error: menuCreateError }] = useCreateMenuMutation({fixedCacheKey: fixedCacheKeys.menus.create_menu})
    const [, {error: menuUpdateError }] = useUpdateMenuMutation({fixedCacheKey: fixedCacheKeys.menus.update_menu})
    const [, {error: menuDeleteError }] = useDeleteMenuMutation({fixedCacheKey: fixedCacheKeys.menus.delete_menu})
    const [, {error: menuMoveLeftError }] = useMoveMenuLeftMutation({fixedCacheKey: fixedCacheKeys.menus.move_menu_left})
    const [, {error: menuMoveRightError }] = useMoveMenuRightMutation({fixedCacheKey: fixedCacheKeys.menus.move_menu_right})
    const menuGetByIDError = useSelector(selectReceivingError(errorKeys.get_menu_by_id))
    const getMenusError = useSelector(selectReceivingError(errorKeys.get_menus))

    useEffect(() => {
        if (!menuCreateError)
            return

        dispatch(setStandardHandlingError(menuCreateError))
    }, [dispatch, menuCreateError])
    
    useEffect(() => {
        if (!menuUpdateError)
            return

        dispatch(setStandardHandlingError(menuUpdateError))
    }, [dispatch, menuUpdateError])

    useEffect(() => {
        if (!menuDeleteError)
            return

        dispatch(setStandardHandlingError(menuDeleteError))
    }, [dispatch, menuDeleteError])
    
    useEffect(() => {
        if (!menuMoveLeftError)
            return

        dispatch(setStandardHandlingError(menuMoveLeftError))
    }, [dispatch, menuMoveLeftError])

    useEffect(() => {
        if (!menuMoveRightError)
            return

        dispatch(setStandardHandlingError(menuMoveRightError))
    }, [dispatch, menuMoveRightError])
    
    useEffect(() => {
        if (!menuGetByIDError|| menuGetByIDError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(menuGetByIDError))
    }, [dispatch, menuGetByIDError])
    
    useEffect(() => {
        if (!getMenusError || getMenusError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(getMenusError))
    }, [dispatch, getMenusError])

    return (
    <div></div>
  )
}

export default MenuErrorsHandler