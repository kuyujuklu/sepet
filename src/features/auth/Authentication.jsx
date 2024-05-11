"use client";
import { useEffect, useState } from "react";
import Input from "../../components/Inputs/Input";
import { Button } from "@mui/material";
import {
    ValidatePassword,
    validateCompanyEmail,
} from "../../validation/validateCompany";
import { useLazyAuthenticateQuery } from "../../api/auth/authQuery";
import { setaccesstoken } from "../../api/auth/authBasedQuery";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useDispatch } from "react-redux";
import { setAuthenticated, setRequireAuthenticationToFalse } from "./authSlice";
import { company } from "../../api/company/company";
import { auth } from "../../api/auth/authQuery";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice";
import { convertRespError } from "../../api/resperrors/convertRespError";
import { appErrors } from "../../errors/errors";
import Header from "./Header";

const Authentication = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [authenticateQuery, { data, error, isLoading }] =
        useLazyAuthenticateQuery();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        if (data?.ok && data?.accesstoken) {
            setaccesstoken(data.accesstoken);
            dispatch(setAuthenticated(true));
            dispatch(setRequireAuthenticationToFalse())
            dispatch(company.util.resetApiState());
            dispatch(auth.util.resetApiState());
            navigate("/admin/company/");
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

        dispatch(setReceivingError({errorKey: errorKeys.authentication, error: newError}))
        dispatch(setAuthenticated(false));
    }, [dispatch, error]);

    const handleButtonClick = () => {
        authenticateQuery({
            data: {
                email,
                password,
            },
        });
    };

    return (
        <div className="flex flex-col items-center w-full h-full m-auto py-2 sm:py-5 gap-5">
            <Header />
            <div
                style={{
                    minHeight: "600px",
                    maxWidth: "500px",
                    borderRadius: "40px",
                }}
                className="flex flex-col gap-y-4 p-2 sm:p-10 w-full m-auto shadow-2xl"
            >
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    {t("admin.authentication.headline")}
                </h1>
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.authentication.your_email")}
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
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {t("admin.authentication.password")}
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
                        >
                            {isLoading ? (
                                <WhiteSpinner />
                            ) : (
                                t("admin.authentication.login")
                            )}
                        </Button>
                    </div>
                </div>
                <NavLink
                    to="/admin/auth/registration"
                    className="mt-4 text-center text-sm text-gray-600 cursor-pointer"
                >
                    {t("admin.authentication.link_to_registration")}
                </NavLink>
            </div>
        </div>
    );
};

export default Authentication;
