"use client"
import { useDispatch, useSelector } from "react-redux";
import Popup from "@/app/shared-components/Popup/Popup";
import { closeUpdatePubPopup, selectUpdatePubPopupState } from "./pubSlice";
import { useCallback, useEffect, useState } from "react";
import { ValidatePub, ValidatePubName } from "../../validation/validatePub";
import InputWithLabel from "../../components/Inputs/InputWithLabel";
import { Button } from "@mui/material";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useUpdatePubMutation } from "../../api/pub/pub";
import SelectWithLabel from "../../components/Inputs/SelectWithLabel";
import { HexColorPicker } from "react-colorful";
import Textarea from "../../components/Inputs/Textarea";
import { currencies } from "../../static-data/data";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "../../api/fixedCacheKeys";

const UpdatePubPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectUpdatePubPopupState);

    const [updatePub, { data, isLoading }] = useUpdatePubMutation({fixedCacheKey: fixedCacheKeys.pubs.update_pub});

    const closePopup = useCallback(() => {
        dispatch(closeUpdatePubPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [colorTheme, setColorTheme] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [wifiPassword, setWifiPassword] = useState("");
    const [address, setAddress] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [currencyID, setCurrencyID] = useState(1);

    const [colorPickerOpened, setColorPickerOpened] = useState(true);

    useEffect(() => {
        setName(popupState?.initialPub?.name ?? "");
        setColorTheme(popupState?.initialPub?.color_theme ?? "");
        setColor(popupState?.initialPub?.color ?? "");
        setWifiPassword(popupState?.initialPub?.wifi_password ?? "");
        setAddress(popupState?.initialPub?.address ?? "");
        setAdditionalInfo(popupState?.initialPub?.additional_info ?? "");
        setCurrencyID(popupState?.initialPub?.currency_id ?? 1);
    }, [popupState.initialPub]);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const pub = {
            name,
            colorTheme,
            color,
            wifiPassword,
            address,
            additionalInfo,
            currencyID: +currencyID,
            languageID: 1,
        };

        let validationErrors = ValidatePub(pub);
        if (validationErrors.length > 0) {
            console.log("validationErrors", validationErrors);
            return;
        }

        let companyID = popupState?.initialPub?.company_id;
        let pubID = popupState?.initialPub?.id;

        if (!companyID || !pubID) {
            return;
        }

        updatePub({
            data: pub,
            companyID,
            pubID,
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.update_pub_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.update_pub_popup.name")}
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
                        label={t("admin.popups.update_pub_popup.wifi_password")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        value={wifiPassword}
                        setValue={setWifiPassword}
                    />

                    <SelectWithLabel
                        wrapperClass="flex items-center gap-4"
                        label={t("admin.popups.update_pub_popup.currency")}
                        labelClassName={
                            "text-sm sm:text-base text-gray-500 font-medium"
                        }
                        selectClassName={"text-xs sm:text-sm"}
                        value={currencyID}
                        setValue={setCurrencyID}
                        values={currencies.map((currency) => ({
                            value: currency.id,
                            text: currency.name + " " + currency.symbol,
                        }))}
                    />

                    {/* Pick color */}
                    <div>
                        <div className="flex items-center gap-10">
                            <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                                {t(
                                    "admin.popups.update_pub_popup.favorite_color"
                                )}
                            </span>
                            <div
                                style={{
                                    width: "60px",
                                    height: "30px",
                                    background: color,
                                }}
                                className="cursor-pointer border-4 rounded-lg "
                                onClick={() =>
                                    setColorPickerOpened(!colorPickerOpened)
                                }
                            ></div>
                        </div>
                        {colorPickerOpened && (
                            <div className="updatePubPopupColorBox mt-2">
                                <HexColorPicker
                                    color={color}
                                    onChange={setColor}
                                />
                            </div>
                        )}
                    </div>

                    <SelectWithLabel
                        wrapperClass="flex items-center gap-4"
                        label={t("admin.popups.update_pub_popup.theme.title")}
                        labelClassName={
                            "text-sm sm:text-base text-gray-500 font-medium"
                        }
                        selectClassName={"text-xs sm:text-sm"}
                        value={colorTheme}
                        setValue={setColorTheme}
                        values={[
                            {
                                value: "light",
                                text: t(
                                    "admin.popups.update_pub_popup.theme.light"
                                ),
                            },
                            {
                                value: "dark",
                                text: t(
                                    "admin.popups.update_pub_popup.theme.dark"
                                ),
                            },
                        ]}
                    />
                    <InputWithLabel
                        label={t("admin.popups.update_pub_popup.address")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        value={address}
                        setValue={setAddress}
                    />
                    {/* additional info */}
                    <div className="flex flex-col">
                        <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                            {t("admin.popups.update_pub_popup.additional_info")}
                        </span>
                        <Textarea
                            value={additionalInfo}
                            setValue={setAdditionalInfo}
                        />
                    </div>
                </main>
                <footer className="text-center">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(31 41 55)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".5rem 0",
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
                            t("admin.popups.update_pub_popup.save_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default UpdatePubPopup;
