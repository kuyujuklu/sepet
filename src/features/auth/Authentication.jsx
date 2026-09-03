"use client";
import { useEffect, useState } from "react";
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
import AuthField from "./AuthField";
import { MailIcon, LockIcon } from "./icons";
import usePageTitle from "@/hooks/usePageTitle";

const Authentication = () => {
    const { t } = useTranslation();
    usePageTitle(t("admin.authentication.headline"));

    const navigate = useNavigate();
    const [authenticateQuery, { data, error, isLoading }] =
        useLazyAuthenticateQuery();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        (async function() {
            if (data?.ok && data?.accesstoken) {
                setaccesstoken(data.accesstoken);
                dispatch(setAuthenticated(true));
                dispatch(setRequireAuthenticationToFalse())
                dispatch(company.util.resetApiState());
                dispatch(auth.util.resetApiState());
                navigate(data?.role === "company" ? "/admin/company/" :
                        data?.role === "admin" ? "/administration/orders" :
                        "/courier");
            }
        })()
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
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ background: "#f5f7fa" }}>
            <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth: 400 }}>
                <Header />

                <div
                    className="w-full bg-white rounded-2xl border"
                    style={{ borderColor: "#e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: "30px 26px" }}
                >
                    <h1 className="text-[21px] font-bold text-ink text-center mb-6">
                        {t("admin.authentication.headline")}
                    </h1>
                    {/* Browsers' password managers key off an actual <form> to
                        both offer saving credentials and (the part that was
                        missing) autofill them on a later visit - the div-only
                        version before this could be saved sometimes but almost
                        never got recognized and refilled automatically. */}
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleButtonClick();
                        }}
                    >
                        <AuthField
                            label={t("admin.authentication.your_email")}
                            icon={MailIcon}
                            type="email"
                            name="email"
                            autoComplete="username"
                            value={email}
                            setValue={setEmail}
                            validators={[validateCompanyEmail]}
                        />
                        <AuthField
                            label={t("admin.authentication.password")}
                            icon={LockIcon}
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            setValue={setPassword}
                            validators={[ValidatePassword]}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                            style={{ background: "#2D7DD2" }}
                        >
                            {isLoading ? <WhiteSpinner width={20} height={20} /> : t("admin.authentication.login")}
                        </button>
                    </form>

                    <NavLink
                        to="/admin/auth/registration"
                        className="mt-5 pt-5 block text-center text-[13.5px] font-semibold"
                        style={{ borderTop: "1px solid #f0f2f5", color: "#2D7DD2" }}
                    >
                        {t("admin.authentication.link_to_registration")}
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Authentication;
