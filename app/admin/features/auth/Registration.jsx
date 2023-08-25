'use client'
import { useEffect, useState } from "react"
import Input from "../../components/Inputs/Input"
import { Button } from "@mui/material"
import { ValidateCompany, ValidatePassword, validateCompanyEmail, validateCompanyName, validateCompayPhone } from "../../validation/validateCompany"
import PhoneNumberInput from "../../components/Inputs/PhoneNumberInput"
import { useLazyRegistrateQuery } from "../../api/auth/authQuery"
import { setAccessToken } from "../../api/auth/authBasedQuery"
import WhiteSpinner from "../../components/loaders/WhiteSpinner"
import { useDispatch } from "react-redux"
import { setAuthenticated } from "./authSlice"
import { company } from "../../api/company/company"
import { NavLink } from "react-router-dom"

const Registration = () => {
    const [registrateQuery, {data, error, isLoading}] = useLazyRegistrateQuery()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const dispatch = useDispatch()

    useEffect(() => {
        if(data?.ok && data?.access_token) {
            setAccessToken(data.access_token)
            dispatch(company.util.resetApiState())
            dispatch(setAuthenticated(true))
        } 
    }, [data, dispatch])

    useEffect(() => {
        if(error?.data?.validationErrors) {
            console.log("errors", error.data.validationErrors)
        }

        setAuthenticated(false)
    }, [error])

    const handleButtonClick = () => {
        let validationErrors = ValidateCompany({email, password, name, phone})
        if(validationErrors && validationErrors.length > 0) {
            console.log("errors", validationErrors)
            return
        }

        registrateQuery({data: {
            email,
            password,
            name,
            phone,
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
                <h1 className="text-2xl font-bold text-gray-700">Зарегистрироваться</h1>
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
                        <div className="text-sm font-medium">Ваше имя</div>
                        <Input 
                            value={name} 
                            setValue={setName} 
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }} 
                            validators={[
                                validateCompanyName,
                            ]}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">Ваш телефон</div>
                        <PhoneNumberInput 
                            value={phone} 
                            setValue={setPhone} 
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }} 
                            validators={[
                                validateCompayPhone,
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
                        >{isLoading ? <WhiteSpinner /> : "Создать аккаунт"}</Button>
                    </div>
                    <NavLink
                        to="/admin/auth/authentication"
                        className="mt-4 text-sm text-center text-gray-600 cursor-pointer"
                    >
                        Уже есть аккаунт? Войти
                    </NavLink>
                </div>
            </div>
        </div>
  )
}

export default Registration