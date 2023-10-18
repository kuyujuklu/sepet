import { Button } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLazyLogoutQuery } from '../../api/auth/authQuery'
import { requireAuthentication, setAuthenticated } from '../auth/authSlice'
import WhiteSpinner from '../../components/loaders/WhiteSpinner'
import { errorKeys, setReceivingError } from '../errorHandlers/errorHandlerSlice'

const LogoutButton = () => {
    const {t} = useTranslation()
    const dispatch = useDispatch()

    const [logoutQuery, { data, error, isLoading }] = useLazyLogoutQuery();

    const handleButtonClick = () => {
        logoutQuery()
    }

    useEffect(() => {
        console.log(error)
        dispatch(setReceivingError({errorKey: errorKeys.logout, error}));
    }, [dispatch, error])

    useEffect(() => {
        if (!data?.ok) return;
            dispatch(setAuthenticated(false));
            dispatch(requireAuthentication());
    }, [data, dispatch])

    return (
    <Button
        variant="contained"
        sx={{
            color: "white",
            bgcolor: "rgb(220 38 38);",
            fontSize: ".7rem",
            fontWeight: "medium",
            padding: ".2rem 1rem",
            borderRadius: "10px",
            textTransform: "none",
            ":hover": {
                bgcolor: "rgb(185 28 28)",
            },
        }}
        onClick={handleButtonClick}
    >
        {isLoading ? (
            <WhiteSpinner  />
        ) : (
            t("admin.logout")
        )}
    </Button>
  )
}

export default LogoutButton