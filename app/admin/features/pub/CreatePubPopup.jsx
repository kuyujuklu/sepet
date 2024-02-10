"use client"
import { useDispatch, useSelector } from "react-redux";
import Popup from "../../components/Popup/Popup";
import { closeCreatePubPopup, selectCreatePubPopupState } from "./pubSlice";
import { useCallback, useEffect, useState } from "react";
import { ValidatePub, ValidatePubName, ValidatePubUrlName } from "../../validation/validatePub";
import InputWithLabel from "../../components/Inputs/InputWithLabel";
import { Button } from "@mui/material";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useCreatePubMutation } from "../../api/pub/pub";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "../../api/fixedCacheKeys";

const CreatePubPopup = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const popupState = useSelector(selectCreatePubPopupState);

    const [createPub, { data, isLoading }] = useCreatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.create_pub});

    const closePopup = useCallback(() => {
        dispatch(closeCreatePubPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [urlName, setUrlName] = useState("");
    // const [currencyID, setCurrencyID] = useState(1);
    // const [languageID, setLanguageID] = useState(1);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const pub = {
            urlName: urlName,
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
                    <InputWithLabel
                        label={t("admin.popups.create_pub_popup.url_name")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={urlName}
                        setValue={setUrlName}
                        validators={[ValidatePubUrlName]}
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
