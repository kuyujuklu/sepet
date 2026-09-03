import { useDispatch } from "react-redux";
import { setAddDishToOrderPopup } from "../ordersSlice";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "./icons";

const AddDishToOrderButton = ({ companyID, pubID, orderID, pubUrlName, currentDishes }) => {
  const { t } = useTranslation();
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
    <button
      onClick={handleButtonClick}
      className="h-11 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold self-start px-4"
      style={{ border: "1.5px dashed #e4e9ee", color: "#2D7DD2" }}
    >
      <PlusIcon stroke="#2D7DD2" />
      {t("admin.admin_panel.order_page.order_position.add_dish_button")}
    </button>
  );
};

export default AddDishToOrderButton;
