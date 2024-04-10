"use client";
import { useEffect, useState } from "react";
import Input from "../../components/Inputs/Input";
import { Button } from "@mui/material";
import {
    ValidateCompany,
    ValidatePassword,
    ValidateRepeatPassword,
    validateCompanyEmail,
    validateCompanyName,
    validateCompayPhone,
} from "../../validation/validateCompany";
import PhoneNumberInput from "../../components/Inputs/PhoneNumberInput";
import { useLazyRegistrateQuery } from "../../api/auth/authQuery";
import { setaccesstoken } from "../../api/auth/authBasedQuery";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useDispatch } from "react-redux";
import { setAuthenticated, setRequireAuthenticationToFalse } from "./authSlice";
import { company } from "../../api/company/company";
import { auth } from "../../api/auth/authQuery"
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice";
import { appErrors } from "../../errors/errors";
import { convertRespError } from "../../api/resperrors/convertRespError";
import Header from "./Header";
import { tariffs } from "../../static-data/data";

const Registration = () => {
    const { t } = useTranslation();
    const [registrateQuery, { data, error, isLoading }] =
        useLazyRegistrateQuery();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const dispatch = useDispatch();

    const urlParams = new URLSearchParams(window.location.search);
    
    //if tariff is not in url params or is not valid, set basic tariff
    const tariff = tariffs[urlParams.get("tariff")] ?  tariffs[urlParams.get("tariff")] : tariffs.basic

    useEffect(() => {
        if (data?.ok && data?.accesstoken) {
            setaccesstoken(data.accesstoken);
            dispatch(setAuthenticated(true))
            dispatch(setRequireAuthenticationToFalse())
            dispatch(company.util.resetApiState());
            dispatch(auth.util.resetApiState());
            navigate("/admin/company");
        }
    }, [data, dispatch, navigate]);

    useEffect(() => {
        if (!error) return;
        let newError = {...error};

        if(newError.status === 400 && newError.data.validationErrors) {
            newError.text = appErrors.validationError
        } else {
            newError.text = convertRespError(newError.data.err)
        }

        dispatch(setReceivingError({errorKey: errorKeys.registration, error: newError}))
        setAuthenticated(false);
    }, [error, dispatch]);

    const handleButtonClick = () => {
        setValidateAll(true);
        let validationErrors = ValidateCompany({
            email,
            password,
            name,
            phone,
        });
        if (validationErrors && validationErrors.length > 0) {
            console.log("errors", validationErrors);
            return;
        }

        let valdationRepeatPasswordError = ValidateRepeatPassword(
            repeatPassword,
            password
        );

        if(valdationRepeatPasswordError) {
            return;
        }

        registrateQuery({
            data: {
                email,
                password,
                name,
                phone,
                tariff
            },
        });
    };

    const [validateAll, setValidateAll] = useState(false); 

    return (
        <div className="flex flex-col items-center w-full h-full py-2 sm:py-5 gap-5">
            <Header />
            <div
                style={{
                    minHeight: "600px",
                    maxWidth: "500px",
                    borderRadius: "40px",
                }}
                className="flex flex-col gap-y-4 p-2 sm:p-10 w-full m-auto shadow-2xl"
            >
                <h1 className="text-2xl font-bold text-gray-700">
                    {t("admin.registration.headline")}
                </h1>
                <div className="flex flex-col gap-2 sm:gap-6">
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.registration.your_email")}
                        </div>
                        <Input
                            type={"email"}
                            value={email}
                            setValue={setEmail}
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }}
                            validators={[validateCompanyEmail]}
                            validationDependencies={{requireValidation: validateAll}}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.registration.your_name")}
                        </div>
                        <Input
                            value={name}
                            setValue={setName}
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }}
                            validators={[validateCompanyName]}
                            validationDependencies={{requireValidation: validateAll}}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.registration.your_phone")}
                        </div>
                        <PhoneNumberInput
                            value={phone}
                            setValue={setPhone}
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }}
                            validators={[validateCompayPhone]}
                            validationDependencies={{requireValidation: validateAll}}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.registration.password")}
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
                            validators={[ValidatePassword]}
                            validationDependencies={{requireValidation: validateAll}}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.registration.repeat_password")}
                        </div>
                        <Input
                            type="password"
                            value={repeatPassword}
                            setValue={setRepeatPassword}
                            style={{
                                marginTop: "10px",
                                minHeight: "40px",
                                fontSize: "16px",
                                maxWidth: "600px",
                            }}
                            validators={[(value) => ValidateRepeatPassword(value, password)]}
                            validationDependencies={{requireValidation: true, password}}
                        />
                    </div>

                    <div className="flex justify-center mt-2">
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
                        >
                            {isLoading ? (
                                <WhiteSpinner />
                            ) : (
                                t("admin.registration.registrate_button")
                            )}
                        </Button>
                    </div>
                    <NavLink
                        to="/admin/auth/authentication"
                        className="mt-4 text-sm text-center text-gray-600 cursor-pointer"
                    >
                        {t("admin.registration.link_to_authentication")}
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Registration;
