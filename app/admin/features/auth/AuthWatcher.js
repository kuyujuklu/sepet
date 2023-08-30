import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {selectIsRequiringAuthentication, setRequireAuthenticationToFalse } from "./authSlice"

const AuthWatcher = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const isRequiringAuthentication = useSelector(selectIsRequiringAuthentication)

    useEffect(() => {
        if (isRequiringAuthentication) {
            dispatch(setRequireAuthenticationToFalse())
            navigate("/auth/authentication")
        }
    }, [dispatch, isRequiringAuthentication, navigate])

    return (
        <></>
    )
}

export default AuthWatcher