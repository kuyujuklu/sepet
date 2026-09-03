"use client";
import { useEffect, useState } from "react";
import {
  ValidateCompany,
  ValidatePassword,
  ValidateRepeatPassword,
  validateCompanyEmail,
  validateCompanyName,
  validateCompayPhone,
} from "../../validation/validateCompany";
import PhoneNumberInput from "../../components/Inputs/PhoneNumberInput";
import { useLazyRegistrateQuery, useLazyRegistrateCourierQuery } from "../../api/auth/authQuery";
import { setaccesstoken } from "../../api/auth/authBasedQuery";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useDispatch } from "react-redux";
import { setAuthenticated, setRequireAuthenticationToFalse } from "./authSlice";
import { company } from "../../api/company/company";
import { auth } from "../../api/auth/authQuery";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  errorKeys,
  setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import { appErrors } from "../../errors/errors";
import { convertRespError } from "../../api/resperrors/convertRespError";
import Header from "./Header";
import AuthField from "./AuthField";
import { MailIcon, LockIcon, UserIcon } from "./icons";
import { tariffs } from "../../static-data/data";
import usePageTitle from "@/hooks/usePageTitle";

const roles = {
  company: "company",
  courier: "courier",
};

const phoneInputStyle = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "1.5px solid #e4e9ee",
  fontSize: 14.5,
  paddingLeft: 48,
  color: "#1c2733",
};

const Registration = () => {
  const { t } = useTranslation();
  usePageTitle(t("admin.registration.headline"));
  const [role, setRole] = useState(roles.company);
  const [registrateQuery, { data, error, isLoading }] =
    useLazyRegistrateQuery();
  const [registrateCourierQuery, { data: courierData, error: courierError, isLoading: isCourierLoading }] =
    useLazyRegistrateCourierQuery();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const dispatch = useDispatch();

  const urlParams = new URLSearchParams(window.location.search);

  //if tariff is not in url params or is not valid, set basic tariff
  const tariff = tariffs[urlParams.get("tariff")]
    ? tariffs[urlParams.get("tariff")]
    : tariffs.basic;

  const finishRegistration = (accessToken, destination) => {
    setaccesstoken(accessToken);
    dispatch(setAuthenticated(true));
    dispatch(setRequireAuthenticationToFalse());
    dispatch(company.util.resetApiState());
    dispatch(auth.util.resetApiState());
    navigate(destination);
  };

  useEffect(() => {
    if (data?.ok && data?.accesstoken) {
      finishRegistration(data.accesstoken, "/admin/company");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (courierData?.ok && courierData?.accesstoken) {
      finishRegistration(courierData.accesstoken, "/courier");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierData]);

  useEffect(() => {
    if (!error && !courierError) return;
    let newError = { ...(error ?? courierError) };

    if (newError.status === 400 && newError.data.validationErrors) {
      newError.text = appErrors.validationError;
    } else {
      newError.text = convertRespError(newError.data.err);
    }

    dispatch(
      setReceivingError({ errorKey: errorKeys.registration, error: newError })
    );
    setAuthenticated(false);
  }, [error, courierError, dispatch]);

  const handleButtonClick = () => {
    setValidateAll(true);

    if (role === roles.courier) {
      const emailError = validateCompanyEmail(email);
      const passwordError = ValidatePassword(password);
      const repeatError = ValidateRepeatPassword(repeatPassword, password);
      if (emailError || passwordError || repeatError) return;

      registrateCourierQuery({ data: { email, password } });
      return;
    }

    let validationErrors = ValidateCompany({
      email,
      password,
      name,
      phone,
    });
    if (validationErrors && validationErrors.length > 0) {
      return;
    }

    let valdationRepeatPasswordError = ValidateRepeatPassword(
      repeatPassword,
      password
    );

    if (valdationRepeatPasswordError) {
      return;
    }

    registrateQuery({
      data: {
        email,
        password,
        name,
        phone,
        tariff,
      },
    });
  };

  const [validateAll, setValidateAll] = useState(false);
  const isLoadingAny = isLoading || isCourierLoading;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ background: "#f5f7fa" }}>
      <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth: 400 }}>
        <Header />

        <div
          className="w-full bg-white rounded-2xl border"
          style={{ borderColor: "#e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: "30px 26px" }}
        >
          <h1 className="text-[21px] font-bold text-ink text-center mb-6">
            {t("admin.registration.headline")}
          </h1>

          {/* Company vs courier - two different signup shapes sharing this
              one form: a courier only ever needs email+password here, the
              rest of their profile is filled in later on their own page. */}
          <div className="flex p-1 rounded-xl mb-5" style={{ background: "#f2f4f6" }}>
            <button
              type="button"
              onClick={() => setRole(roles.company)}
              className="flex-1 h-9 rounded-lg text-[13px] font-semibold"
              style={{
                background: role === roles.company ? "#1c2733" : "transparent",
                color: role === roles.company ? "#fff" : "#526070",
              }}
            >
              {t("admin.registration.role_company")}
            </button>
            <button
              type="button"
              onClick={() => setRole(roles.courier)}
              className="flex-1 h-9 rounded-lg text-[13px] font-semibold"
              style={{
                background: role === roles.courier ? "#1c2733" : "transparent",
                color: role === roles.courier ? "#fff" : "#526070",
              }}
            >
              {t("admin.registration.role_courier")}
            </button>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleButtonClick();
            }}
          >
            {role === roles.company && (
              <>
                <AuthField
                  label={t("admin.registration.your_name")}
                  icon={UserIcon}
                  value={name}
                  setValue={setName}
                  validators={[validateCompanyName]}
                  validationDependencies={{ requireValidation: validateAll }}
                />
                <div>
                  <div className="text-[13px] font-medium text-ink mb-1.5">
                    {t("admin.registration.your_phone")}
                  </div>
                  <PhoneNumberInput
                    value={phone}
                    setValue={setPhone}
                    style={phoneInputStyle}
                    validators={[validateCompayPhone]}
                    validationDependencies={{ requireValidation: validateAll }}
                  />
                </div>
              </>
            )}

            <AuthField
              label={t("admin.registration.your_email")}
              icon={MailIcon}
              type="email"
              value={email}
              setValue={setEmail}
              validators={[validateCompanyEmail]}
              validationDependencies={{ requireValidation: validateAll }}
            />
            <AuthField
              label={t("admin.registration.password")}
              icon={LockIcon}
              type="password"
              value={password}
              setValue={setPassword}
              validators={[ValidatePassword]}
              validationDependencies={{ requireValidation: validateAll }}
            />
            <AuthField
              label={t("admin.registration.repeat_password")}
              icon={LockIcon}
              type="password"
              value={repeatPassword}
              setValue={setRepeatPassword}
              validators={[(value) => ValidateRepeatPassword(value, password)]}
              validationDependencies={{ requireValidation: true, password }}
            />

            <button
              type="submit"
              disabled={isLoadingAny}
              className="w-full h-12 rounded-xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ background: "#2D7DD2" }}
            >
              {isLoadingAny ? (
                <WhiteSpinner width={20} height={20} />
              ) : (
                t("admin.registration.registrate_button")
              )}
            </button>
          </form>

          <NavLink
            to="/admin/auth/authentication"
            className="mt-5 pt-5 block text-center text-[13.5px] font-semibold"
            style={{ borderTop: "1px solid #f0f2f5", color: "#2D7DD2" }}
          >
            {t("admin.registration.link_to_authentication")}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Registration;
