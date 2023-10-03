"use client"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import {
    closeDeleteCategoryPopup,
    selectDeleteCategoryPopupState,
} from "./categorySlice";
import { useDeleteCategoryMutation } from "@/app/admin/api/categories/category";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";

const DeleteCategoryPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectDeleteCategoryPopupState);

    const [deleteCategory, { data, isLoading }] =
        useDeleteCategoryMutation({fixedCacheKey: fixedCacheKeys.categories.delete_category});

    const closePopup = useCallback(() => {
        dispatch(closeDeleteCategoryPopup());
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

        if (!companyID || !pubID || !menuID || !categoryID) {
            return;
        }

        deleteCategory({
            companyID,
            pubID,
            menuID,
            categoryID,
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        {t("admin.popups.delete_category_popup.headline")}
                    </h1>
                </header>
                <main className="mb-10">
                    <p className="text-center">
                        {t("admin.popups.delete_category_popup.text")}
                        <br />
                        {t("admin.popups.delete_category_popup.warning")}
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
                            t(
                                "admin.popups.delete_category_popup.delete_button"
                            )
                        )}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default DeleteCategoryPopup;
