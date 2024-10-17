import { useDispatch, useSelector } from "react-redux";
import { useGetFullPubInfoQuery } from "../../../../api/pub/pub";
import { selectDeleteDishFromOrderPopupState, setDeleteFromOrderDishPopupState } from "../ordersSlice";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";
import { useUpdateOrderDishesMutation } from "../../../../api/orders/orders";
import Popup from "../../../../components/Popup/Popup";
import { Button } from "@mui/material";
import WhiteSpinner from "../../../../components/loaders/WhiteSpinner";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";

const DeleteDishFromOrderPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectDeleteDishFromOrderPopupState);

  const [
    updateDishesQuery,
    {
      data: updateDishesQueryData,
      error: updateDishesQueryError,
      isLoading: updateDishesQueryIsLoading,
    },
  ] = useUpdateOrderDishesMutation({fixedCacheKey: fixedCacheKeys.order.deleteDishFromOrder});

  const closePopup = useCallback(() => {
    dispatch(
      setDeleteFromOrderDishPopupState({
        opened: false,
        pubUrlName: null,
        pubID: null,
        newDishes: null,
        companyID: null,
        orderID: null,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (updateDishesQueryData) {
      closePopup();
    }
  }, [closePopup, updateDishesQueryData]);

  const handleButtonClick = () => {
    let pubID = popupState?.pubID;
    let orderID = popupState?.orderID;
    let companyID = popupState?.companyID;
    let newDishes = popupState?.newDishes;

    if (!companyID || !orderID || !pubID || !newDishes) {
      return;
    }


    updateDishesQuery({ orderID, pubID, companyID, dishes: newDishes });
  };

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4">
        <header>
          <h1 className="font-bold text-center text-xl mb-10">
            {t("admin.popups.delete_dish_from_order_popup.headline")}
          </h1>
        </header>
        <main className="mb-10">
          <p className="text-center">
            {t("admin.popups.delete_dish_from_order_popup.warning")}
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
            {updateDishesQueryIsLoading ? (
              <WhiteSpinner />
            ) : (
              t("admin.popups.delete_dish_from_order_popup.delete_button")
            )}
          </Button>
        </footer>
      </div>
    </Popup>
  );
};

export default DeleteDishFromOrderPopup;
