"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputWithLabel from "@/app/admin/components/Inputs/InputWithLabel";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import {
    closeCreateDishPopup,
    selectCreateDishPopupState,
} from "./dishesSlice";
import { HexColorPicker } from "react-colorful";
import CheckboxWithLabel from "@/app/admin/components/Inputs/CheckboxWithLabel";
import { useCreateDishMutation } from "@/app/admin/api/dish/dish";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";

const CreateDishPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectCreateDishPopupState);

    const [createDish, { data, isLoading }] = useCreateDishMutation({fixedCacheKey: fixedCacheKeys.dishes.create_dish});

    const closePopup = useCallback(() => {
        dispatch(closeCreateDishPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [ingredients, setingredients] = useState("");
    const [textColor, setTextColor] = useState("#ffffff");
    const [visible, setVisible] = useState(true);

    const [colorPickerOpened, setColorPickerOpened] = useState(true);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const dish = {
            name,
            price: Number(price),
            ingredients,
            visible,
            textColor,
            place: popupState.place ?? 1,
        };

        if (
            !popupState.companyID ||
            !popupState.pubID ||
            !popupState.menuID ||
            !popupState.categoryID ||
            !popupState.place
        ) {
            return;
        }

        createDish({
            data: dish,
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
                        {t("admin.popups.create_dish_popup.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={t("admin.popups.create_dish_popup.name")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                    />
                    <InputWithLabel
                        label={t("admin.popups.create_dish_popup.price")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={price}
                        setValue={setPrice}
                    />
                    <InputWithLabel
                        label={t("admin.popups.create_dish_popup.ingredients")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={ingredients}
                        setValue={setingredients}
                    />
                    {/* Pick color */}
                    <div>
                        <div className="flex items-center gap-10">
                            <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                                {t("admin.popups.create_dish_popup.text_color")}{" "}
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
                        label={t("admin.popups.create_dish_popup.visible")}
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
                            t("admin.popups.create_dish_popup.create_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default CreateDishPopup;
