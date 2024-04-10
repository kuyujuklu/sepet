"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import Popup from "@/app/shared-components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import {
    closeDeleteDishPopup,
    selectDeleteDishPopupState,
} from "./dishesSlice";
import { useDeleteDishMutation } from "@/app/admin/api/dish/dish";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";

const DeleteDishPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectDeleteDishPopupState);

    const [deleteDish, { data, isLoading }] = useDeleteDishMutation({fixedCacheKey: fixedCacheKeys.dishes.delete_dish});

    const closePopup = useCallback(() => {
        dispatch(closeDeleteDishPopup());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    const handleButtonClick = () => {
        let companyID = popupState?.companyID;
        let pubID = popupState?.pubID;
        let menuID = popupState?.menuID;
        let categoryID = popupState?.categoryID;
        let dishID = popupState?.dishID;

        if (!companyID || !pubID || !menuID || !categoryID || !dishID) {
            return;
        }

        deleteDish({
            companyID,
            pubID,
            menuID,
            categoryID,
            dishID,
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.delete_dish_popup.headline")}
                    </h1>
                </header>
                <main className="mb-10">
                    <p className="text-center">
                        {t("admin.popups.delete_dish_popup.text")}
                        <br />
                        {t("admin.popups.delete_dish_popup.warning")}
                    </p>
                </main>
                <footer className="text-center">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(220 38 38)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".5rem 0",
                            borderRadius: "10px",
                            width: "90%",
                            ":hover": {
                                bgcolor: "rgb(185 28 28)",
                            },
                        }}
                        onClick={handleButtonClick}
                    >
                        {isLoading ? (
                            <WhiteSpinner />
                        ) : (
                            t("admin.popups.delete_dish_popup.delete_button")
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default DeleteDishPopup;
