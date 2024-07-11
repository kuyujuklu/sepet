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
        padding: ".5rem 2.5rem",
        borderRadius: "10px",
        width: "fit-content",
        ":hover": {
          bgcolor: "#3b82f6",
        },
      }}
      onClick={handleButtonClick}
    >
      <div className="flex items-center">
        <div style={{width: 25, height: 25, padding: "4px 5px 5px 5px"}}>
          <img src="/static/admin/images/svg/plus-white.svg" />
        </div>
        <span className="font-bold">{t("admin.admin_panel.order_page.order_position.add_dish_button")}</span>
      </div>
    </Button>
  );
};

export default AddDishToOrderButton;
