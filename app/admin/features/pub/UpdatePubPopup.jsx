import { useDispatch, useSelector } from "react-redux";
import Popup from "../../components/Popup/Popup";
import { closeUpdatePubPopup, selectUpdatePubPopupState } from "./pubSlice";
import { useCallback, useEffect, useState } from "react";
import {
    ValidatePub,
    ValidatePubName,
    ValidatePubUrl,
} from "../../validation/validatePub";
import InputWithLabel from "../../components/Inputs/InputWithLabel";
import { Button } from "@mui/material";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useUpdatePubMutation } from "../../api/pub/pub";
import SelectWithLabel from "../../components/Inputs/SelectWithLabel";
import { HexColorPicker } from "react-colorful";
import Textarea from "../../components/Inputs/Textarea";

const UpdatePubPopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectUpdatePubPopupState);

    const [updatePub, { data, error, isLoading }] = useUpdatePubMutation();

    const closePopup = useCallback(() => {
        dispatch(closeUpdatePubPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [colorTheme, setColorTheme] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [wifiPassword, setWifiPassword] = useState("");
    const [address, setAddress] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    // const [currencyID, setCurrencyID] = useState(1);

    const [colorPickerOpened, setColorPickerOpened] = useState(false);

    useEffect(() => { 
        setName(popupState?.initialPub?.name ?? "")
        setColorTheme(popupState?.initialPub?.color_theme ?? "")
        setColor(popupState?.initialPub?.color ?? "")
        setWifiPassword(popupState?.initialPub?.wifi_password ?? "")
        setAddress(popupState?.initialPub?.address ?? "")
        setAdditionalInfo(popupState?.initialPub?.additional_info ?? "")
    }, [popupState.initialPub])

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    useEffect(() => {
        if (error) {
            //TODO: handle error
        }
    }, [closePopup, data, error]);

    const handleButtonClick = () => {
        const pub = {
            name,
            colorTheme,
            color,
            wifiPassword,
            address,
            additionalInfo,
            currencyID: 1,
            languageID: 1,
        };

        let validationErrors = ValidatePub(pub);
        if (validationErrors.length > 0) {
            console.log('validationErrors', validationErrors)
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
            pubID
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        Редактировать заведение
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={"Название заведения"}
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
                        label="Пароль от wifi"
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        value={wifiPassword}
                        setValue={setWifiPassword}
                    />

                    {/* Pick color */}
                    <div>
                        <div className="flex items-center gap-10">
                            <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">Предпочитаемый цвет </span>
                            <div
                                style={{
                                    width: "60px",
                                    height: "30px",
                                    backgroundColor: color,
                                }}
                                className="cursor-pointer border rounded-lg"
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
                        label={"Тема"}
                        labelClassName={
                            "text-sm sm:text-base text-gray-500 font-medium"
                        }
                        selectClassName={"text-xs sm:text-sm"}
                        value={colorTheme}
                        setValue={setColorTheme}
                        values={[
                            {
                                value: "light",
                                text: "Светлая",
                            },
                            {
                                value: "dark",
                                text: "Темная",
                            },
                        ]}
                    />
                    <InputWithLabel
                        label="Адрес"
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        value={address}
                        setValue={setAddress}
                    />
                    {/* additional info */}
                    <div className="flex flex-col">
                        <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">Дополнительная информация </span>
                        <Textarea value={additionalInfo} setValue={setAdditionalInfo}/>
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
                        {isLoading ? <WhiteSpinner /> : "Сохранить"}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default UpdatePubPopup;
