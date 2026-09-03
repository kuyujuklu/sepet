import { useDispatch, useSelector } from "react-redux";
import Popup from "../../../components/Popup/Popup";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  closeCourierReserveOrderPopup,
  selectCourierReserveOrderPopupState,
  setCourierReserveOrderPopup,
} from "../courier-orders/courierOrdersSlice";
import { useReserveOrderMutation } from "../../../api/courier/courier";
import { fixedCacheKeys } from "../../../api/fixedCacheKeys";
import { Button } from "@mui/material";
import { pushAlert } from "../../alerts/alertSlice";
import { courierOrderFilters } from "../courier-orders/CourierOrdersFilter";
import { useNavigate } from "react-router-dom";

const CourierReserveOrderPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate()

  const popupState = useSelector(selectCourierReserveOrderPopupState);

  const closePopup = useCallback(() => {
    dispatch(closeCourierReserveOrderPopup());
  }, [dispatch]);

  const [reserveOrderQuery, { isLoading: isReserveOrderQueryLoading }] =
    useReserveOrderMutation({
      fixedCacheKey: fixedCacheKeys.courier.reserve_order,
    });

  const reserveOrder = () => {
    if (!popupState?.courierID || !popupState?.orderID) {
      return;
    }

    reserveOrderQuery({
      courierID: popupState.courierID,
      orderID: popupState.orderID,
    })
      .unwrap()
      .then(() => {
        dispatch(pushAlert({
            message: t("courier.courier_order.you_reserved_order"),
            type: "success",
            delay: 3000,
        }))

        navigate("/courier/orders", {state: {ordersFilter: courierOrderFilters.active}})
        closePopup()
      })
      .catch(() => {
        // Real failure (order already taken, not eligible, etc.) - stays on
        // the popup so the courier can back out; CourierErrorHandlers.jsx
        // already surfaces the actual error message globally.
      })
  };

  const isAvailableForReservation =
    popupState.courierID && popupState.orderID && !isReserveOrderQueryLoading;

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <header className="mb-10">
        <h1 className="text-center text-gray-800 text-xl font-bold px-16">
          {t("admin.popups.courier_reserve_order_popup.headline")} №{popupState.orderID}
        </h1>
      </header>
      <main className="flex flex-col gap-6 mb-6">
          <div className="flex gap-5">
            <Button
              disabled={!isAvailableForReservation}
              variant="contained"
              sx={{
                color: "white",
                bgcolor: isAvailableForReservation ? "#3b82f6" : "gray",
                fontSize: ".6rem",
                fontWeight: "medium",
                padding: ".4rem 1rem",
                borderRadius: "10px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: " center",
                gap: ".6rem",
                ":hover": {
                  bgcolor: isAvailableForReservation ? "#2563eb" : "gray",
                },
              }}
              onClick={reserveOrder}
            >
              <div style={{ width: 20 }}>
                <img
                  style={{ width: "100%", height: "100%" }}
                  src="/static/admin/images/svg/tap-colored.svg"
                  alt="salary"
                />
              </div>
              <span className="text-xs">{t("yes")}</span>
            </Button>
            <Button
              variant="contained"
              sx={{
                color: "white",
                bgcolor: "rgb(75 85 99)",
                fontSize: ".6rem",
                fontWeight: "medium",
                padding: ".4rem 1rem",
                borderRadius: "10px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: " center",
                gap: ".6rem",
                ":hover": {
                  bgcolor: "rgb(55 65 81)",
                },
              }}
              onClick={closePopup}
            >
              <span className="text-xs">{t("no")}</span>
            </Button>
          </div>

          </main>
      <footer className="text-center flex items-center justify-center"></footer>
    </Popup>
  );
};

export default CourierReserveOrderPopup;
