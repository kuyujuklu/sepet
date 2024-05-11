"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { closeUpdateMenuPopup, selectUpdateMenuPopupState } from "./menuSlice";
import { useUpdateMenuMutation } from "@/api/menu/menu";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import Popup from "@/components/Popup/Popup";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import CheckboxWithLabel from "@/components/Inputs/CheckboxWithLabel";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

const UpdateMenuPopup = () => {
    const {t} = useTranslation()
    const dispatch = useDispatch();
    const popupState = useSelector(selectUpdateMenuPopupState);

	const [updateMenu, {data, isLoading}] = useUpdateMenuMutation({fixedCacheKey: fixedCacheKeys.menus.update_menu})

    const closePopup = useCallback(() => {
        dispatch(closeUpdateMenuPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    useEffect(() => {
        if (popupState.initialMenu) {
            setName(popupState.initialMenu.name);
            setVisible(popupState.initialMenu.visible);
        }
    }, [popupState.initialMenu]);

	const handleButtonClick = () => {
		const pub = {
            name,
            visible,
        }

        if(!popupState.companyID || !popupState.pubID || !popupState.menuID) {
            return
        }

        updateMenu({data: pub, companyID: popupState.companyID, pubID : popupState.pubID, menuID: popupState.menuID})
	}

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.update_menu_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.update_menu_popup.name")}
                        labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                    />

                    <CheckboxWithLabel
                        value={visible}
                        setValue={setVisible}
                        label={t("admin.popups.update_menu_popup.visible")}
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
                        {isLoading ? <WhiteSpinner /> : t("admin.popups.update_menu_popup.save_button")}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default UpdateMenuPopup;
