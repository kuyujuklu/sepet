import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { setAddDishToOrderPopup } from "../ordersSlice";
import { useTranslation } from "react-i18next";

const AddDishToOrderButton = ({ companyID, pubID, orderID, pubUrlName, currentDishes }) => {
  const{t} = useTranslation()
  const dispatch = useDispatch();
  const handleButtonClick = () => {
    dispatch(setAddDishToOrderPopup({
        opened: true,
        pubID,
        companyID, 
        orderID,
        pubUrlName,
        currentDishes
    }));
  };



  return (
    <Button
      variant="contained"
      sx={{
        color: "white",
        bgcolor: "#3b82f6",
        fontSize: ".7rem",
        fontWeight: "medium",
        padding: ".2rem 1rem",
        borderRadius: "10px",
        width: "fit-content",
        ":hover": {
          bgcolor: "#2563eb",
        },
      }}
      onClick={handleButtonClick}
    >
      <span>{t("admin.admin_panel.order_page.order_position.add_dish_button")}</span>
    </Button>
  );
};

export default AddDishToOrderButton;
