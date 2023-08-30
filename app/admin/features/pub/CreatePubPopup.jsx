import { useDispatch, useSelector } from "react-redux";
import Popup from "../../components/Popup/Popup";
import { closeCreatePubPopup, selectCreatePubPopupState } from "./pubSlice";
import { useCallback, useEffect, useState } from "react";
import { ValidatePub, ValidatePubName } from "../../validation/validatePub";
import InputWithLabel from "../../components/Inputs/InputWithLabel";
import { Button } from "@mui/material";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useCreatePubMutation } from "../../api/pub/pub";
import { appErrors } from "../../errors/errors";
import { requireAuthentication } from "../auth/authSlice";
import { useTranslation } from "react-i18next";

const CreatePubPopup = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const popupState = useSelector(selectCreatePubPopupState);

    const [createPub, { data, error, isLoading }] = useCreatePubMutation();

    const closePopup = useCallback(() => {
        dispatch(closeCreatePubPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    // const [currencyID, setCurrencyID] = useState(1);
    // const [languageID, setLanguageID] = useState(1);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    useEffect(() => {
        if (error && error.text === appErrors.unauthorized) {
            dispatch(requireAuthentication());
        }
    }, [data, dispatch, error]);

    const handleButtonClick = () => {
        const pub = {
            name,
            currencyID: 1,
            languageID: 1,
        };

        let validationErrors = ValidatePub(pub);
        if (validationErrors.length > 0) {
            return;
        }

        if (!popupState.companyID) {
            return;
        }

        createPub({ data: pub, companyID: popupState.companyID });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.create_pub_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.create_pub_popup.name")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                        validators={[ValidatePubName]}
                    />
                </main>
                <footer className="text-center">
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
                            t("admin.popups.create_pub_popup.create_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default CreatePubPopup;
