import { useCreatePubMutation, useDeletePubMutation, useUpdatePubMutation } from "@/app/admin/api/pub/pub"
import { useEffect } from "react"
import { errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys"
import { appErrors } from "@/app/admin/errors/errors"

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

        dispatch(handleErrorStandardWay(pubCreateError))
    }, [dispatch, pubCreateError])

    useEffect(() => {
        if (!pubUpdateError)
            return

        dispatch(handleErrorStandardWay(pubUpdateError))
    }, [dispatch, pubUpdateError])

    useEffect(() => {
        if (!pubDeleteError)
            return

        dispatch(handleErrorStandardWay(pubDeleteError))
    }, [dispatch, pubDeleteError])
    
    useEffect(() => {
        if (!pubUploadBgError)
            return

        let newErr = {...pubUploadBgError}

        if(pubUploadBgError.text === appErrors.invalidFileExtension) {
            newErr.text = appErrors.fileIsNotAnImage
        }

        dispatch(handleErrorStandardWay(newErr))
    }, [dispatch, pubUploadBgError])

    useEffect(() => {
        if (!pubGetByIDError  || pubGetByIDError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(pubGetByIDError))
    }, [dispatch, pubGetByIDError])
    
    useEffect(() => {
        if (!getPubsError || getPubsError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(getPubsError))
    }, [dispatch, getPubsError])

    return (
    <div></div>
  )
}

export default PubErrorsHandler