"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import Popup from "@/components/Popup/Popup";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import {
    closeBulkPricePopup,
    selectBulkPricePopupState,
} from "./categorySlice";
import { useBulkUpdateDishPricesMutation } from "@/api/dish/dish";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

const BulkPricePopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectBulkPricePopupState);

    const [percent, setPercent] = useState("");

    const [bulkUpdateDishPrices, { data, isLoading }] =
        useBulkUpdateDishPricesMutation({ fixedCacheKey: fixedCacheKeys.dishes.bulk_update_dish_prices });

    const closePopup = useCallback(() => {
        setPercent("");
        dispatch(closeBulkPricePopup());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        const { companyID, pubID, menuID, categoryID } = popupState;
        if (!companyID || !pubID || !menuID || !categoryID || percent === "" || isNaN(+percent)) {
            return;
        }

        bulkUpdateDishPrices({ companyID, pubID, menuID, categoryID, percent: +percent });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-2">
                        {t("admin.popups.bulk_price_popup.headline")}
                    </h1>
                    {popupState.categoryName && (
                        <p className="text-center text-gray-500 text-sm mb-8">
                            {popupState.categoryName}
                        </p>
                    )}
                </header>
                <main className="mb-10 flex flex-col items-center gap-2">
                    <InputWithLabel
                        label={t("admin.popups.bulk_price_popup.percent")}
                        labelClassName="text-xs sm:text-base text-gray-500 font-medium"
                        labelStyle={{ marginBottom: ".1rem" }}
                        value={percent}
                        setValue={setPercent}
                    />
                    <p className="text-xs text-gray-500 text-center">
                        {t("admin.popups.bulk_price_popup.description")}
                    </p>
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
                            t("admin.popups.bulk_price_popup.apply_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default BulkPricePopup;
