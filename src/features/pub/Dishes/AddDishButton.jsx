"use client"
import { useDispatch, useSelector } from "react-redux";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useContext } from "react";
import { PubColorContext, ThemeContext } from "../PubPage";
import { openCreateDishPopup } from "./dishesSlice";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const AddDishButton = ({ categoryID, menuID }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const pubID = useSelector(selectPubID);
    const companyID = useSelector(selectCompanyID);

    const themeContext = useContext(ThemeContext);
    const pubColor = useContext(PubColorContext);

    const handleButtonClick = () => {
        dispatch(
            openCreateDishPopup({
                pubID,
                companyID,
                menuID,
                categoryID,
                place: 1,
            })
        );
    };

    return (
        <div className="text-center">
            <Button
                variant="contained"
                sx={{
                    color: themeContext.textColor,
                    bgcolor: "transparent",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".7rem 1rem",
                    border: "1px solid " + themeContext.textColor,
                    borderRadius: "10px",
                    width: "100%",
                    ":hover": {
                        color: themeContext.bgColor,
                        border: "1px solid " + pubColor,
                        bgcolor: pubColor,
                    },
                }}
                onClick={handleButtonClick}
            >
                {t("admin.dishes.add_dish_button")}
            </Button>
        </div>
    );
};

export default AddDishButton;
