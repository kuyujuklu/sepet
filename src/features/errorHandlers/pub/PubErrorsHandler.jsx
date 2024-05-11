import { useCreatePubMutation, useDeletePubMutation, useSetPreorderMutation, useUpdatePubMutation } from "@/api/pub/pub"
import { useEffect } from "react"
import { errorKeys, selectReceivingError, handleErrorStandardWay  } from "../errorHandlerSlice"
import { useDispatch, useSelector } from "react-redux"
import { fixedCacheKeys } from "@/api/fixedCacheKeys"
import { appErrors } from "@/errors/errors"

const PubErrorsHandler = () => {
    const dispatch = useDispatch()
    const [, {error: pubCreateError }] = useCreatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.create_pub})
    const [, {error: pubUpdateError }] = useUpdatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.update_pub})
    const [, {error: pubDeleteError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.delete_pub})
    const [, {error: pubUploadBgError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.upload_pub_bg})
    const [, {error: pubSetShippingError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.set_shipping})
    const [, {error: pubSetShippingAvailibilityError }] = useDeletePubMutation({fixedCacheKey: fixedCacheKeys.pubs.set_shipping_availability})
    const [, {error: pubSetPreorderError }] = useSetPreorderMutation({fixedCacheKey: fixedCacheKeys.pubs.set_preorder})
    const [, {error: pubSetShippingTimeError }] = useSetPreorderMutation({fixedCacheKey: fixedCacheKeys.pubs.set_shipping_time})
    
    const pubGetByIDError = useSelector(selectReceivingError(errorKeys.get_pub_by_id))
    const getPubsError = useSelector(selectReceivingError(errorKeys.get_pubs))
    const getFullPubInfoError = useSelector(selectReceivingError(errorKeys.get_full_pub_info))
    const getPubShippingError = useSelector(selectReceivingError(errorKeys.get_pub_shipping))
    const getPubPreorderError = useSelector(selectReceivingError(errorKeys.get_pub_preorder))

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
        if (!pubSetShippingAvailibilityError)
            return

        dispatch(handleErrorStandardWay(pubSetShippingAvailibilityError))
    }, [dispatch, pubSetShippingAvailibilityError])

    useEffect(() => {
        if (!pubSetShippingError)
            return

        dispatch(handleErrorStandardWay(pubSetShippingError))
    }, [dispatch, pubSetShippingError])

    useEffect(() => {
        if (!pubSetPreorderError)
            return

        dispatch(handleErrorStandardWay(pubSetPreorderError))
    }, [dispatch, pubSetPreorderError])
    
    useEffect(() => {
        if (!pubSetShippingTimeError)
            return

        dispatch(handleErrorStandardWay(pubSetShippingTimeError))
    }, [dispatch, pubSetShippingTimeError])
    

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

    useEffect(() => {
        if (!getFullPubInfoError || getFullPubInfoError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(getFullPubInfoError))
    }, [dispatch, getFullPubInfoError])

    useEffect(() => {
        if (!getPubShippingError || getPubShippingError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(getPubShippingError))
    }, [dispatch, getPubShippingError])

    useEffect(() => {
        if (!getPubPreorderError || getPubPreorderError.originalStatus === 404)
            return

        dispatch(handleErrorStandardWay(getPubPreorderError))
    }, [dispatch, getPubPreorderError])

    return (
    <div></div>
  )
}

export default PubErrorsHandler