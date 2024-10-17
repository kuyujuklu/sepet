import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import {
  orderPaymentTypes,
  orderStatuses,
  orderTypes,
} from "../../../static-data/data";
import {
  useReserveOrderMutation,
  useSetOrderStatusToCanceledMutation,
  useSetOrderStatusToCompletedMutation,
} from "../../../api/courier/courier";
import { fixedCacheKeys } from "../../../api/fixedCacheKeys";
import { Button } from "@mui/material";
import { courierOrderFilters } from "./CourierOrdersFilter";
import { useEffect, useMemo } from "react";
import { useGetFullPubInfoQuery } from "../../../api/pub/pub";
import { useDispatch } from "react-redux";
import { setCourierReserveOrderPopup } from "./courierOrdersSlice";
import { getOrderColor, translateOrderStatus } from "../../../utils/order-utils";
import { pushAlert } from "../../alerts/alertSlice";

const CourierOrderCard = ({ courierID, order, courierOrdersFilter }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation();

  const {
    data: pub,
    error: pubError,
    isLoading: isPubLoading,
  } = useGetFullPubInfoQuery(
    { pubUrlName: order.pub.url_name },
    { skip: !order.pub.url_name }
  );

  useEffect(() => {
    console.log("PUB DATA:", pub);
  }, [pub]);

  const shownDishesArray = useMemo(() => {
    if (!pub?.dishes) return [];
    if (!order?.dishes) return [];

    const pubDishesMap = new Map();
    for (const dish of pub?.dishes) {
      pubDishesMap.set(dish.id, dish);
    }

    //[{order_dish, pub_dish}]
    const shownDishesArray = [];
    for (const order_dish_info of order.dishes) {
      if (!pubDishesMap.get(order_dish_info.dish_id)) {
        console.log("dish undefined: ", order_dish_info.id);
        continue;
      }

      shownDishesArray.push({
        order_dish: order_dish_info,
        pub_dish: pubDishesMap.get(order_dish_info.dish_id),
      });
    }
    return shownDishesArray;
  }, [order.dishes, pub?.dishes]);

  const productsPrice  = useMemo(() => {
      if(!shownDishesArray) return 0;

      return shownDishesArray.reduce((acc, dishObject) => acc + dishObject.order_dish.count * dishObject.order_dish.dish_price, 0)
  }, [shownDishesArray])

  const totalFromClient = (order.delivery_price + productsPrice) ?? 0
  const [setToCompletedQuery, { isSetToCompletedQueryLoading }] =
    useSetOrderStatusToCompletedMutation({
      fixedCacheKey: fixedCacheKeys.courier.set_order_to_completed,
    });

  const [setToCanceledQuery, { isSetToCanceledQueryLoading }] =
    useSetOrderStatusToCanceledMutation({
      fixedCacheKey: fixedCacheKeys.courier.set_order_to_canceled,
    });

  const reserveOrder = () => {
    if (!courierID || !order?.id) {
      return;
    }

    dispatch(setCourierReserveOrderPopup({opened: true, courierID: courierID, orderID: order.id}))

  };
  const setToCompleted = () => {
    if (!courierID || !order?.id) {
      return;
    }

    setToCompletedQuery({ courierID, orderID: order.id });

    dispatch(pushAlert({
        message: t("courier.courier_order.you_delivered_order"),
        type: "success",
        delay: 3000,
    }))

  };

  const setToCanceled = () => {
    if (!courierID || !order?.id) {
      return;
    }

    setToCanceledQuery({ courierID, orderID: order.id });
  };

  const isAvailableForReservation =
    order?.courier_info?.is_reserved === false &&
    order?.courier_info?.reserver_courier_id === 0;
  const isAvailableForSetToCompleted =
    order?.courier_info?.reserver_courier_id === courierID && order?.status !== orderStatuses.completed && order?.status !== orderStatuses.canceled ;
  const isAvailableForSetToCanceled =
    order?.courier_info?.reserver_courier_id === courierID && order?.status !== orderStatuses.completed && order?.status !== orderStatuses.canceled;

  return (
    <div
      className="w-full rounded-2xl shadow-x border px-4 py-4 text-2xs"
      style={{
        maxWidth: "900px",
        border: "solid 2px",
        borderColor:
          courierOrdersFilter === courierOrderFilters.active
            ? "#059669"
            : courierOrdersFilter === courierOrderFilters.available
                ? "#ed5e21"
                : "black",
      }}
    >
      <div className="grid gap-y-3 items-center gap-x-2 grid-cols-3">
        <div className="font-bold">
          {t("courier.courier_order.order")} №{order?.id}
        </div>
        <div className="">
          {ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
        </div>

        <div
          className="flex items-center justify-center rounded-md text-white"
          style={{ background: getOrderColor(order?.status) }}
        >
          <div style={{ width: 13, aspectRatio: 1 }}>
            <img
              style={{ width: "100%", height: "100%" }}
              src="/static/admin/images/svg/sand-clock-colored.svg"
              alt="sand-clock"
            />
          </div>
          <span>{t(translateOrderStatus(order?.status))}</span>
        </div>

        <div className="grid col-span-3 grid-cols-6 gap-y-1 gap-x-2">
          <span className="font-bold col-span-2">{order?.pub_name}</span>{" "}
          <span className="font-light text-left col-span-4">
            {order?.pub?.address}
          </span>
          <div className="col-span-6 grid grid-cols-6">
            <div className="col-span-2"></div>
            <hr className="col-span-2" />
            <div className="col-span-2"></div>
          </div>
          <div className="col-span-2 flex gap-2 justify-start">
            <img
              style={{ width: 18, height: 18 }}
              src="/static/admin/images/svg/location-black.svg"
              alt="location"
            />
            <span className="font-bold">{t("courier.courier_order.where")}: </span>
          </div>
          <span className="font-light break-words col-span-4">
            {order?.town + " " + order?.full_address}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div style={{ width: 25 }}>
            <img
              style={{ width: "100%", height: "100%" }}
              src="/static/admin/images/svg/distance-colored.svg"
              alt="distance"
            />
          </div>
          <div className="font-bold">
            {(order?.courier_info?.distance / 1000).toFixed(1) || "unknown"} {" "} km
          </div>
        </div>
        <div className="flex items-center gap-2 ">
          <div style={{ width: 25 }}>
            <img
              style={{ width: "100%", height: "100%" }}
              src="/static/admin/images/svg/card-colored.svg"
              alt="card"
            />
          </div>
          {order?.payment_type === orderPaymentTypes.cash && (
            <span className="font-bold">{t("courier.order_payment_types.cash")}</span>
          )}
          {order?.payment_type === orderPaymentTypes.cardOffline && (
            <span className="font-bold">{t("courier.order_payment_types.card_offline")}</span>
          )}
          {(order?.payment_type !== orderPaymentTypes.cardOffline && order?.payment_type !== orderPaymentTypes.cash) && (
            <span className="font-bold">{t("courier.order_payment_types.not_proceeded")}</span>
          )}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div style={{ width: 25 }}>
            <img
              style={{ width: "100%", height: "100%" }}
              src="/static/admin/images/svg/salary-colored.svg"
              alt="salary"
            />
          </div>
          <span className="font-bold">
            {order?.courier_info?.courier_reward} Lei
          </span>
        </div>
        {(courierOrdersFilter === courierOrderFilters.completed || courierOrdersFilter === courierOrderFilters.active) && (
          <>
            <div className="flex items-center gap-2 justify-start col-span-3">
              <span className="font-bold">{t("courier.courier_order.client_name")}:</span>
              <span>{order.client_name}</span>
            </div>
            <div className="flex items-center gap-2 justify-start col-span-3">
              <span className="font-bold">{t("courier.courier_order.client_main_phone")}:</span>
              <span>{order.main_phone_number}</span>
            </div>
            {order.second_phone_number && (
              <div className="flex items-center gap-2 justify-start col-span-3">
                <span className="font-bold">{t("courier.courier_order.client_second_phone")}:</span>{" "}
                <span>{order.second_phone_number}</span>
              </div>
            )}
            {order.comments && (
              <div className="flex items-center gap-2 justify-start col-span-3">
                <span className="font-bold">{t("courier.courier_order.comments")}:</span>{" "}
                <span>{order.comments}</span>
              </div>
            )}
            {shownDishesArray && (
              <>
                <div className="flex items-center gap-2 justify-start col-span-3">
                  <span className="font-bold">{t("courier.courier_order.positions")}:</span>{" "}
                </div>
                <ol className="text-xs w-full col-span-3">
                  {shownDishesArray.map((dishObject, index) => (
                    <li>
                      <span className="font-bold">{index + 1}.</span> {dishObject.pub_dish.name} -{" "}
                      {dishObject.order_dish.count}{t("courier.courier_order.pieces_shortcut")}. -{" "}
                      {(dishObject.order_dish.dish_price *
                        dishObject.order_dish.count).toFixed(2)} {" "} Lei
                    </li>
                  ))}
                </ol>
                <div className="col-span-3 ml-3 flex flex-col">
                  <div>
                    <span className="font-bold">{t("courier.courier_order.products_price")}:</span> {productsPrice.toFixed(2)} Lei
                  </div>
                  <div>
                    <span className="font-bold">{t("courier.courier_order.delivery_price")}:</span> {order.delivery_price.toFixed(2)} Lei
                  </div>
                  <div>
                    <span className="font-bold">{t("courier.courier_order.total_from_client")}:</span> {totalFromClient.toFixed(2)} Lei
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {isAvailableForReservation && (
          <Button
            className="col-span-3"
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
            {" "}
            <div style={{ width: 20 }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src="/static/admin/images/svg/tap-colored.svg"
                alt="salary"
              />
            </div>
            <span>{t("courier.courier_order.reserve_order")}</span>
          </Button>
        )}
        {isAvailableForSetToCompleted && (
          <Button
            className="col-span-3"
            disabled={!isAvailableForSetToCompleted}
            variant="contained"
            sx={{
              color: "white",
              bgcolor: isAvailableForSetToCompleted ? "#059669" : "gray",
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
                bgcolor: isAvailableForSetToCompleted ? "#059682" : "gray",
              },
            }}
            onClick={setToCompleted}
          >
            {" "}
            <div style={{ width: 20 }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src="/static/admin/images/svg/tap-colored.svg"
                alt="salary"
              />
            </div>
            <span>{t("courier.courier_order.set_order_to_completed")}</span>
          </Button>
        )}
        {/* {isAvailableForSetToCanceled && (
          <Button
            className="col-span-3"
            disabled={!isAvailableForSetToCanceled}
            variant="contained"
            sx={{
              color: "white",
              bgcolor: isAvailableForSetToCanceled ? "#5c5c5c" : "gray",
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
                bgcolor: isAvailableForSetToCanceled ? "#5c5c5e" : "gray",
              },
            }}
            onClick={setToCanceled}
          >
            {" "}
            <div style={{ width: 20 }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src="/static/admin/images/svg/tap-colored.svg"
                alt="salary"
              />
            </div>
            <span>{t("courier.courier_order.set_order_to_canceled")}</span>
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default CourierOrderCard;
