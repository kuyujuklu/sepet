import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputWithLabel from "@/app/admin/components/Inputs/InputWithLabel";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import {
    closeUpdateCategoryPopup,
    selectUpdateCategoryPopupState,
} from "./categorySlice";
import { useUpdateCategoryMutation } from "@/app/admin/api/categories/category";
import { HexColorPicker } from "react-colorful";
import CheckboxWithLabel from "@/app/admin/components/Inputs/CheckboxWithLabel";
import { requireAuthentication } from "../../auth/authSlice";
import { useTranslation } from "react-i18next";

const UpdateCategoryPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectUpdateCategoryPopupState);

    const [updateCategory, { data, error, isLoading }] =
        useUpdateCategoryMutation();

    const closePopup = useCallback(() => {
        dispatch(closeUpdateCategoryPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [visible, setVisible] = useState(true);
    const [textColor, setTextColor] = useState("#ffffff");
    const [colorPickerOpened, setColorPickerOpened] = useState(true);

    useEffect(() => {
        if (popupState.initialCategory) {
            setName(popupState.initialCategory.name ?? "");
            setVisible(popupState.initialCategory.visible);
            setTextColor(
                popupState.initialCategory.text_color
                    ? popupState.initialCategory.text_color
                    : "#ffffff"
            );
        }
    }, [popupState.initialCategory]);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    useEffect(() => {
        if (error && error.text === error.unauthorized) {
            dispatch(requireAuthentication());
        }
    }, [dispatch, error]);

    const handleButtonClick = () => {
        const pub = {
            name,
            visible,
            textColor,
        };

        if (
            !popupState.companyID ||
            !popupState.pubID ||
            !popupState.menuID ||
            !popupState.categoryID
        ) {
            return;
        }

        updateCategory({
            data: pub,
            companyID: popupState.companyID,
            pubID: popupState.pubID,
            menuID: popupState.menuID,
            categoryID: popupState.categoryID,
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.update_category_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.update_category_popup.name")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                    />
                    {/* Pick color */}
                    <div>
                        <div className="flex items-center gap-10">
                            <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                                {t(
                                    "admin.popups.update_category_popup.text_color"
                                )}{" "}
                            </span>
                            <div
                                style={{
                                    width: "60px",
                                    height: "30px",
                                    background: textColor,
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
                                    color={textColor}
                                    onChange={setTextColor}
                                />
                            </div>
                        )}
                    </div>
                    <CheckboxWithLabel
                        value={visible}
                        setValue={setVisible}
                        label={t("admin.popups.update_category_popup.visible")}
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
                        {isLoading ? (
                            <WhiteSpinner />
                        ) : (
                            t("admin.popups.update_category_popup.save_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default UpdateCategoryPopup;
