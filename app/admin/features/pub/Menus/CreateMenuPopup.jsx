"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { closeCreateMenuPopup, selectCreateMenuPopupState } from "./menuSlice";
import { useCreateMenuMutation } from "@/app/admin/api/menu/menu";
import InputWithLabel from "@/app/admin/components/Inputs/InputWithLabel";
import Popup from "@/app/shared-components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import CheckboxWithLabel from "@/app/admin/components/Inputs/CheckboxWithLabel";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";

const CreateMenuPopup = () => {
    const {t} = useTranslation()
    const dispatch = useDispatch();
    const popupState = useSelector(selectCreateMenuPopupState);

    const [createMenu, { data, isLoading }] = useCreateMenuMutation({fixedCacheKey: fixedCacheKeys.menus.create_menu});

    const closePopup = useCallback(() => {
        dispatch(closeCreateMenuPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const pub = {
            name,
            visible,
            place: popupState.place ?? 1,
        };

        if (!popupState.companyID || !popupState.pubID || !popupState.place) {
            return;
        }

        createMenu({
            data: pub,
            companyID: popupState.companyID,
            pubID: popupState.pubID,
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.create_menu_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.create_menu_popup.name")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                    />

                    <CheckboxWithLabel
                        value={visible}
                        setValue={setVisible}
                        label={t("admin.popups.create_menu_popup.visible")}
                        labelClass={
                            "mr-2 text-xs sm:text-base text-gray-500 font-medium"
                        }
                        inputStyle={{ padding: 0 }}
                        inputClass={"border-gray-500"}
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
                        {isLoading ? <WhiteSpinner /> : t("admin.popups.create_menu_popup.create_button")}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default CreateMenuPopup;
