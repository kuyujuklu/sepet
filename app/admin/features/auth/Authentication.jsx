'use client'
import { useEffect, useState } from "react"
import Input from "../../components/Inputs/Input"
import { Button } from "@mui/material"
import { ValidatePassword, validateCompanyEmail } from "../../validation/validateCompany"
import { useLazyAuthenticateQuery } from "../../api/auth/authQuery"
import { setAccessToken } from "../../api/auth/authBasedQuery"
import WhiteSpinner from "../../components/loaders/WhiteSpinner"
import { useDispatch } from "react-redux"
import { setAuthenticated } from "./authSlice"
import { company } from "../../api/company/company"
import { NavLink, useNavigate } from "react-router-dom"

const Authentication = () => {
    const navigate = useNavigate()
    const [authenticateQuery, {data, error, isLoading}] = useLazyAuthenticateQuery()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const dispatch = useDispatch()

    useEffect(() => {
        if(data?.ok && data?.access_token) {
            setAccessToken(data.access_token)
            dispatch(company.util.resetApiState())
            dispatch(setAuthenticated(true))
        }
    }, [data, dispatch])


      useEffect(() => {
        if(!error) return;
    
        if(error?.data?.validationErrors) {
          console.log("errors", error.data.validationErrors)
        }
    
        dispatch(setAuthenticated(false))
      }, [dispatch, error])

    const handleButtonClick = () => {
        authenticateQuery({data: {
            email,
            password,
        }})
    }

    return (
        <div className="flex w-full h-full border border-gray">
            <div 
                style={{
                    minHeight: "600px",
                    maxWidth: "500px",
                    borderRadius: "40px",
                }}
                className="flex flex-col gap-y-4 p-10 w-full m-auto shadow-2xl"
            >
                <h1 className="text-2xl font-bold text-gray-700">Авторизуйтесь</h1>
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="text-sm font-medium">Ваш Email</div>
                        <Input 
                            value={email} 
                            setValue={setEmail} 
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }} 
                            validators={[
                                validateCompanyEmail,
                            ]}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">Пароль</div>
                        <Input 
                            type="password"
                            value={password} 
                            setValue={setPassword} 
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }} 
                            validators={[
                                ValidatePassword,
                            ]}
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="contained"
                            sx={{
                                color: "white",
                                bgcolor: "rgb(31 41 55)",
                                fontSize: ".7rem",
                                fontWeight: "medium",
                                padding: ".7rem 1rem",
                                borderRadius: "10px",
                                width: "90%",
                                ":hover": {
                                    bgcolor: "rgb(17 24 39)",
                                },
                            }}
                            onClick={handleButtonClick}
                        >{isLoading ? <WhiteSpinner /> : "Войти в аккаунт"}</Button>
                    </div>
                </div>
                <NavLink
                    to="/admin/auth/registration"
                    className="mt-4 text-center text-sm text-gray-600 cursor-pointer"
                >
                    Нет аккаунта? Зарегистрироваться
                </NavLink>
            </div>
        </div>
  )
}

export default Authentication