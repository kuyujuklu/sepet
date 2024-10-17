import { useState } from "react"
import Input from "../Inputs/Input"
import { validateCompanyEmail, validateCompayPhone, ValidatePassword } from "../../validation/validateCompany"
import { useTranslation } from "react-i18next"
import { Button } from "@mui/material"
import WhiteSpinner from "../loaders/WhiteSpinner"
import { NavLink } from "react-router-dom"
import PhoneNumberInput from "../Inputs/PhoneNumberInput"
import { useDispatch } from "react-redux"
import { pushAlert } from "../../features/alerts/alertSlice"
import { deleteAccount } from "../../api/app-client/app-client-api"

const DeleteClientAccount = () => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    console.log("PHONE: ", phone)

    const sendPhone = () => {
        if(!phone || phone.length !== 11) {
            dispatch(pushAlert({
                type: "danger",
                header: "Ivalid phone",
                delay: 3000,
            }))
            return;
        }
        
        (async function() {
            let newPhone = phone.slice(3, phone.length)
            const body = await deleteAccount({password, phone: newPhone})
            if(body.err) {
                dispatch(pushAlert({
                    type: "danger",
                    header: body.err,
                    delay: 3000,
                }))
                return;
            }
            dispatch(pushAlert({
                type: "success",
                header: "Your account has been deleted",
                delay: 3000,
            }))
            setPhone("")
            setPassword("")
        }())

    }
  
    return (
        <div style={{height: "80vh"}} className="flex flex-col justify-center items-center w-full h-full m-auto py-2 sm:py-5 gap-5">
        <div
            style={{
                minHeight: "600px",
                maxWidth: "500px",
                borderRadius: "40px",
            }}
            className="flex flex-col gap-y-4 p-2 sm:p-10 w-full m-auto shadow-2xl"
        >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                Sepet MD Удаление аккаунта
            </h1>
            <h1 className="text-lg sm:text-lg font-medium text-gray-700">
                Для удаления аккаунта введите номер телефона и пароль, ваш аккаунт будет моментально удален
            </h1>
            <div className="flex flex-col gap-6">
                <div>
                    <div className="text-sm font-medium">
                        Номер телефона
                    </div>
                    <PhoneNumberInput
                        type={"phone"}
                        value={phone}
                        setValue={setPhone}
                        style={{
                            marginTop: "10px",
                            minHeight: "40px",
                            fontSize: "16px",
                            maxWidth: "600px",
                        }}
                        validators={[validateCompayPhone]}
                    />
                </div>
                <div>
                    <div className="text-sm font-medium">
                        {t("Пароль")}
                    </div>
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
                        validators={[]}
                    />
                </div>  

                <div className="flex justify-center">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(239 68 68)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".7rem 1rem",
                            borderRadius: "10px",
                            width: "90%",
                            ":hover": {
                                bgcolor: "rgb(185 28 28)",
                            },
                        }}
                        onClick={sendPhone}
                    >
                        {false ? (
                            <WhiteSpinner />
                        ) : (
                            "Удалить"
                        )}
                    </Button>
                </div>
            </div>
                <a
                    href="mailto:mdsandex@gmail.com"
                    className="mt-4 text-center text-sm text-gray-600 cursor-pointer"
                >
                    Не помните пароль, напишите нашей поддержке <span className="text-blue-600">mdsandex@gmail.com</span>
                </a>
        </div>
    </div>
  )
}

export default DeleteClientAccount
