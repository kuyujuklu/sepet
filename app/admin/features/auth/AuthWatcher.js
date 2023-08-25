import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { selectAuthenticated } from "./authSlice"

const AuthWatcher = () => {
    const navigate = useNavigate()

    const authenticated = useSelector(selectAuthenticated)

    useEffect(() => {
        if (authenticated) {
            navigate("/admin/company")
        } else {
            navigate("/admin/auth/authentication")
        }
    }, [authenticated])

    return (
        <></>
    )
}

export default AuthWatcher