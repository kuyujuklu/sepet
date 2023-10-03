import { useCreatePubMutation, useDeletePubMutation, useUpdatePubMutation } from "@/app/admin/api/pub/pub"
import { useEffect } from "react"
import { errorKeys, selectReceivingError, setStandardHandlingError  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys"

const PubErrorsHandler = () => {
    const dispatch = useDispatch()
    const [, {error: pubCreateError }] = useCreatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.create_pub})
    const [, {error: pubUpdateError }] = useUpdatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.update_pub})
    const [, {error: pubDeleteError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.delete_pub})
    const [, {error: pubUploadBgError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.upload_pub_bg})
    const pubGetByIDError = useSelector(selectReceivingError(errorKeys.get_pub_by_id))
    const getPubsError = useSelector(selectReceivingError(errorKeys.get_pubs))

    useEffect(() => {
        if (!pubCreateError)
            return

        dispatch(setStandardHandlingError(pubCreateError))
    }, [dispatch, pubCreateError])

    useEffect(() => {
        if (!pubUpdateError)
            return

        dispatch(setStandardHandlingError(pubUpdateError))
    }, [dispatch, pubUpdateError])

    useEffect(() => {
        if (!pubDeleteError)
            return

        dispatch(setStandardHandlingError(pubDeleteError))
    }, [dispatch, pubDeleteError])
    
    useEffect(() => {
        if (!pubUploadBgError)
            return

        dispatch(setStandardHandlingError(pubUploadBgError))
    }, [dispatch, pubUploadBgError])

    useEffect(() => {
        if (!pubGetByIDError  || pubGetByIDError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(pubGetByIDError))
    }, [dispatch, pubGetByIDError])
    
    useEffect(() => {
        if (!getPubsError || getPubsError.originalStatus === 404)
            return

        dispatch(setStandardHandlingError(getPubsError))
    }, [dispatch, getPubsError])

    return (
    <div></div>
  )
}

export default PubErrorsHandler