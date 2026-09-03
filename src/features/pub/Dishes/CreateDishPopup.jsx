"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import Popup from "@/components/Popup/Popup";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import {
    closeCreateDishPopup,
    selectCreateDishPopupState,
} from "./dishesSlice";
import { HexColorPicker } from "react-colorful";
import CheckboxWithLabel from "@/components/Inputs/CheckboxWithLabel";
import { useCreateDishMutation } from "@/api/dish/dish";
import { useGetModifierGroupsQuery } from "@/api/modifiers/modifiers";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { hhmmToMinutes } from "@/utils/time";

const CreateDishPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectCreateDishPopupState);

    const [createDish, { data, isLoading }] = useCreateDishMutation({fixedCacheKey: fixedCacheKeys.dishes.create_dish});

    const { data: modifierGroupsData } = useGetModifierGroupsQuery(
        { companyID: popupState.companyID, pubID: popupState.pubID },
        { skip: !popupState.companyID || !popupState.pubID }
    );
    const modifierGroups = modifierGroupsData?.modifier_groups ?? [];

    const closePopup = useCallback(() => {
        dispatch(closeCreateDishPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [salePrice, setSalePrice] = useState("");
    const [ingredients, setingredients] = useState("");
    const [textColor, setTextColor] = useState("#ffffff");
    const [visible, setVisible] = useState(true);
    const [isHit, setIsHit] = useState(false);
    const [available, setAvailable] = useState(true);
    // Equal from/to (the "00:00" default included) means "no schedule -
    // always available", same sentinel the backend uses.
    const [availabilityFrom, setAvailabilityFrom] = useState("00:00");
    const [availabilityTo, setAvailabilityTo] = useState("00:00");
    const [modifierGroupIds, setModifierGroupIds] = useState([]);

    const [colorPickerOpened, setColorPickerOpened] = useState(true);

    const toggleModifierGroup = (groupID) => {
        setModifierGroupIds((prev) =>
            prev.includes(groupID)
                ? prev.filter((id) => id !== groupID)
                : [...prev, groupID]
        );
    };

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const dish = {
            name,
            price: Number(price),
            salePrice: +salePrice,
            ingredients,
            visible,
            isHit,
            available,
            textColor,
            place: popupState.place ?? 1,
            availabilityStart: hhmmToMinutes(availabilityFrom),
            availabilityEnd: hhmmToMinutes(availabilityTo),
            modifierGroupIds,
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
                        label={t("admin.popups.create_dish_popup.sale_price")}
                        labelClassName={
                            "text-xs sm:text-base text-gray-500 font-medium"
                        }
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={salePrice}
                        setValue={setSalePrice}
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
                    {/* Bestseller: the app shows a "хит" badge on these */}
                    <CheckboxWithLabel
                        value={isHit}
                        setValue={setIsHit}
                        label={t("admin.popups.create_dish_popup.is_hit")}
                        labelClass={
                            "mr-2 text-xs sm:text-base text-gray-500 font-medium"
                        }
                        inputStyle={{ padding: 0 }}
                        inputClass={"border-gray-500"}
                    />
                    {/* Stop list: stays on the menu but cannot be ordered */}
                    <CheckboxWithLabel
                        value={available}
                        setValue={setAvailable}
                        label={t("admin.popups.create_dish_popup.available")}
                        labelClass={
                            "mr-2 text-xs sm:text-base text-gray-500 font-medium"
                        }
                        inputStyle={{ padding: 0 }}
                        inputClass={"border-gray-500"}
                    />
                    {/* Availability schedule: equal from/to means no
                        restriction, matches the backend's sentinel */}
                    <div>
                        <div className="text-xs sm:text-base text-gray-500 font-medium mb-1">
                            {t("admin.popups.create_dish_popup.availability_schedule")}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                value={availabilityFrom}
                                onChange={(e) => setAvailabilityFrom(e.target.value)}
                                className="border rounded px-2 py-1 text-sm border-gray-400"
                            />
                            <span className="text-gray-500 text-sm">—</span>
                            <input
                                type="time"
                                value={availabilityTo}
                                onChange={(e) => setAvailabilityTo(e.target.value)}
                                className="border rounded px-2 py-1 text-sm border-gray-400"
                            />
                        </div>
                    </div>
                    {modifierGroups.length > 0 && (
                        <div>
                            <div className="text-xs sm:text-base text-gray-500 font-medium mb-1">
                                {t("admin.popups.create_dish_popup.modifier_groups")}
                            </div>
                            <div className="flex flex-col gap-1">
                                {modifierGroups.map((group) => (
                                    <CheckboxWithLabel
                                        key={group.id}
                                        value={modifierGroupIds.includes(group.id)}
                                        setValue={() => toggleModifierGroup(group.id)}
                                        label={group.name}
                                        labelClass={
                                            "mr-2 text-xs sm:text-base text-gray-500 font-medium"
                                        }
                                        inputStyle={{ padding: 0 }}
                                        inputClass={"border-gray-500"}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
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
