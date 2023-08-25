import { Button } from "@mui/material";
import { useContext } from "react";
import { PubColorContext, ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openCreateCategoryPopup } from "./categorySlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { selectMenuID } from "../Menus/menuSlice";

const AddCategoryButton = () => {
  const dispatch = useDispatch();
  
  const pubID = useSelector(selectPubID);
  const companyID = useSelector(selectCompanyID);
  const menuID = useSelector(selectMenuID);

  const themeContext = useContext(ThemeContext)
  const pubColor = useContext(PubColorContext)

  const handleButtonClick = () => {
        dispatch(openCreateCategoryPopup({pubID, companyID, menuID, place: 1}))
  }

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
                {"Добавить категорию"}
            </Button>
        </div>
    );
};

export default AddCategoryButton;
