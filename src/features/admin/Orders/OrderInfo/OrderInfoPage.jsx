import { useDispatch, useSelector } from "react-redux";
import { selectOrders, setDeleteFromOrderDishPopupState, setUpdateOrderApproximateTimePopup } from "../ordersSlice";
import { useEffect, useMemo, useState } from "react";
import OrderCard from "../OrderCard";
import { useParams } from "react-router-dom";
import { useGetFullPubInfoQuery } from "@/api/pub/pub";
import {
  errorKeys,
  setReceivingError,
} from "../../../errorHandlers/errorHandlerSlice";
import OrderPosition from "./OrderPosition";
import OrderStatuses from "./OrderStatuses";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { orderTypes } from "@/static-data/data";
import { useTranslation } from "react-i18next";
import { pub } from "../../../../api/pub/pub";
import AddDishToOrderButton from "./AddDishToOrderButton";
import Select from "../../../../components/Inputs/Select";
import { Button, Checkbox } from "@mui/material";
import { useUpdateOrderDeliveryPriceMutation, useUpdatePreparedMutation } from "../../../../api/orders/orders";
import OrderCourierInfo from "../OrderCourierInfo";
import { deliveryTypes } from "../../../../static-data/data";
import { KeyboardReturnTwoTone } from "@mui/icons-material";
import CheckboxWithLabel from "../../../../components/Inputs/CheckboxWithLabel";
import { ConvertQrMenuApiTimeToLocal } from "../../../../utils/time";

const OrderInfoPage = ({ pubUrlName }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orderID = +useParams().orderID;
  const orders = useSelector(selectOrders);

  const order = useMemo(() => {
    if (!orderID || !orders) return null;

    const order = orders.find((item) => item.id === orderID);
    return order ?? null;
  }, [orderID, orders]);

  const {
    data: pubData,
    error: pubError,
    isLoading: isPubLoading,
  } = useGetFullPubInfoQuery({ pubUrlName: pubUrlName }, { skip: !pubUrlName });

  const orderItemsPrice = useMemo(() => {
    if (!order || !pubData) return 0;

    const itemsPrice = order?.dishes?.reduce(
      (acc, item) => acc + item.dish_price * item.count,
      0
    );

    return itemsPrice;
  }, [order, pubData]);

  //handle pubError
  useEffect(() => {
    if (!pubError) return;

    dispatch(
      setReceivingError({
        errorKey: errorKeys.get_full_pub_info,
        error: pubError,
      })
    );
  }, [dispatch, pubError]);

  const shownDishes = useMemo(() => {
    const dishCountsAndFixedPrice = order?.dishes?.reduce((acc, item) => {
      acc[item.dish_id] = { count: item.count, fixedPrice: item.dish_price };
      return acc;
    }, {});

    if (!dishCountsAndFixedPrice || !pubData?.dishes) return;

    const shownDishes = pubData?.dishes
      ?.map((item) =>
        dishCountsAndFixedPrice[item.id]
          ? {
            dish: item,
            count: dishCountsAndFixedPrice[item.id].count,
            fixedPrice: dishCountsAndFixedPrice[item.id].fixedPrice,
          }
          : false
      )
      .filter((item) => !!item);

    return shownDishes;
  }, [order?.dishes, pubData]);

  const finalPrice = orderItemsPrice + order?.delivery_price;

  const deletePosition = (dishID) => {
    if (
      !dishID ||
      !pubData?.pub.id ||
      !pubUrlName ||
      !pubData?.pub?.company_id
    ) {
      return;
    }
    const newDishes = order?.dishes.filter((dish) => dish.dish_id !== dishID);

    dispatch(
      setDeleteFromOrderDishPopupState({
        opened: true,
        pubUrlName,
        pubID: pubData?.pub?.id,
        newDishes: newDishes,
        companyID: pubData?.pub?.company_id,
        orderID,
      })
    );
  };

  const [
    sendDeliveryPrice,
    {
      data: saveOrderDeliveryPriceData,
      error: saveOrderDeliveryPriceError,
      isLoading: isDeliveryPriceLoading,
    },
  ] = useUpdateOrderDeliveryPriceMutation();


  const saveDeliveryPrice = () => {
    const companyID = pubData?.pub?.company_id;
    const pubID = pubData?.pub?.id;
    if (!companyID || !pubID || !orderID || isNaN(+orderDeliveryPrice)) return;

    sendDeliveryPrice({ companyID, pubID, orderID, price: orderDeliveryPrice });
  };

  const [
    updatePrepared,
    {
      data: updatedOrderPreparedData,
      error: updatedOrderPreparedError,
      isLoading: isPreparedLoading,
    },
  ] = useUpdatePreparedMutation();


  const setPrepared = (prepared) => {
    const companyID = pubData?.pub?.company_id;
    const pubID = pubData?.pub?.id;
    if (!companyID || !pubID || !orderID) return;

    updatePrepared({ companyID, pubID, orderID, prepared });
  };

  const [orderDeliveryPrice, setOrderDeliveryPrice] = useState(0);
  useEffect(() => {
    if (!order) return;

    setOrderDeliveryPrice(order.delivery_price);
  }, [order]);

  const setDeliveryPriceValue = (value) => {
    if (isNaN(+value)) return;

    setOrderDeliveryPrice(value);
  };

  const possibleDeliveryPrices = pubData?.pub?.shipping?.shipping_prices
    ? [0, ...Object.values(pubData?.pub?.shipping?.shipping_prices)]
    : [0];

  const openOrderUpdateApproximateTimePopup = () => {
    const companyID = pubData?.pub?.company_id;
    const pubID = pubData?.pub?.id;

    if (!companyID || !pubID || !orderID) return;

    dispatch(setUpdateOrderApproximateTimePopup({
      opened: true,
      pubID,
      companyID,
      orderID
    }))
  }

  return (
    <div className="flex flex-col items-center m-auto">
      {!order && (
        <span className="font-bold text-lg">
          {t("admin.admin_panel.order_page.order_not_found")}
        </span>
      )}
      {order && pubData && (
        <>
          <div
            className="px-4 mt-2 w-full flex flex-col items-center gap-y-2"
            style={{ maxWidth: "900px" }}
          >
            <div className="w-full mb-4">
              <OrderCard order={order} hasArrow={false} />
            </div>

            {pubData?.pub?.shipping?.delivery_type === deliveryTypes.deliveryService &&
              <div className="w-full mb-4">
                <OrderCourierInfo order={order} />
              </div>
            }

            <div className="mb-6">
              <OrderStatuses
                companyID={pubData?.pub?.company_id}
                pubID={pubData?.pub?.id}
                orderID={orderID}
                status={order.status}
              />

              <div className="flex flex-row justify-between w-full gap-5">
                {order.status === "preparing" &&
                  <div className="flex items-center">
                    <span onClick={() => setPrepared(!order?.prepared)}>Заказ готов </span>
                    <CheckboxWithLabel
                      value={order?.prepared}
                      setValue={(prep) => setPrepared(prep)}
                    />
                  </div>
                }

                {order.status === "preparing" &&
                  <div className="flex items-center gap-2">
                    <span>Курьер приедет к: </span>
                    <span>{ConvertQrMenuApiTimeToLocal(order?.approximate_preparation_time)}</span>
                    <Button
                      variant="contained"
                      sx={{
                        color: "white",
                        bgcolor: "#3b82f6",
                        fontSize: ".6rem",
                        fontWeight: "medium",
                        padding: ".2rem",
                        borderRadius: "10px",
                        width: "fit-content",
                        ":hover": {
                          bgcolor: "#3b82f6",
                        },
                      }}
                      onClick={openOrderUpdateApproximateTimePopup}
                    >
                      <div className="flex items-center">
                        <span className="font-bold">{t("изменить")}</span>
                      </div>
                    </Button>

                  </div>
                }
              </div>
            </div>


            <div className="grid grid-cols-2 w-full px-10 mb-10">
              {order.order_type === orderTypes.delivery && (
                <>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.town")}:
                    </span>{" "}
                    <span>{order.town}</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.full_address")}:
                    </span>{" "}
                    <span>{order.full_address}</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.main_phone")}:
                    </span>{" "}
                    <span>{order.main_phone_number}</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.second_phone")}:
                    </span>{" "}
                    <span>{order.second_phone_number}</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.payment_type")}:
                    </span>{" "}
                    <span>
                      {order.payment_type === "cash" &&
                        t(
                          "admin.admin_panel.order_page.order_payment_types.cash"
                        )}
                    </span>
                    <span>
                      {order.payment_type === "card_offline" &&
                        t(
                          "admin.admin_panel.order_page.order_payment_types.card_offline"
                        )}
                    </span>
                    <span>
                      {order.payment_type !== "card_offline" &&
                        order.payment_type !== "cash" &&
                        t(
                          "admin.admin_panel.order_page.order_payment_types.not_proceeded"
                        )}
                    </span>
                  </div>
                </>
              )}
              {order.order_type === orderTypes.inPlace && (
                <>
                  <div>
                    <span className="font-bold">
                      {t("admin.admin_panel.order_page.table_number")}:
                    </span>{" "}
                    <span>{order.table_for_in_place_order}</span>
                  </div>
                </>
              )}
            </div>

            {shownDishes && (
              <>
                {shownDishes.map((item, index) => (
                  <div
                    key={item.dish?.id}
                    className="w-full gap-x-2 grid grid-cols-12 items-center"
                  >
                    <div className="col-span-1">{index + 1}.</div>
                    <div className="col-span-11">
                      <OrderPosition
                        deletePosition={() => deletePosition(item.dish?.id)}
                        pub={pubData?.pub}
                        dish={item.dish}
                        count={item.count}
                        fixedPrice={item.fixedPrice}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            <AddDishToOrderButton
              currentDishes={order?.dishes}
              pubUrlName={pubUrlName}
              pubID={pubData?.pub?.id}
              companyID={pubData?.pub?.company_id}
              orderID={orderID}
            />
            {shownDishes && (
              <>
                <div className="w-full px-20 py-5">
                  <div>
                    {t("admin.admin_panel.order_page.total_price_of_products")}:{" "}


                    {pubData?.pub?.shipping?.add_commission_to_dish_prices ?
                      (orderItemsPrice / 1.1).toFixed(2) :
                      orderItemsPrice.toFixed(2)
                    } Lei


                  </div>
                  {pubData?.pub?.shipping?.add_commission_to_dish_prices &&
                    <div>
                      {/* commission */}
                      {t("commission")}:{" "}
                      {(orderItemsPrice - orderItemsPrice / 1.1).toFixed(2)} Lei

                    </div>
                  }
                  {order.order_type === orderTypes.delivery && (
                    <div className="flex items-center gap-5">
                      {t("admin.admin_panel.order_page.price_of_shipping")}:{" "}
                      <Select
                        value={orderDeliveryPrice}
                        setValue={setDeliveryPriceValue}
                        values={possibleDeliveryPrices.map((price) => ({
                          value: price,
                          text: price + " Lei",
                        }))}
                      />
                      {+order?.delivery_price !== orderDeliveryPrice && (
                        <Button
                          variant="contained"
                          sx={{
                            color: "white",
                            bgcolor: "#3b82f6",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".2rem 1rem",
                            borderRadius: "10px",
                            width: "fit-content%",
                            ":hover": {
                              bgcolor: "#2563eb",
                            },
                          }}
                          onClick={saveDeliveryPrice}
                        >
                          <span>
                            {isDeliveryPriceLoading ? (
                              <BlackSpinner />
                            ) : (
                              t("admin.admin_panel.shipping.shipping_time.save")
                            )}
                          </span>
                        </Button>
                      )}
                    </div>
                  )}
                  <div>
                    {t("admin.admin_panel.order_page.final_price")}:{" "}
                    {finalPrice.toFixed(2)} Lei
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col w-full px-16 justify-start mt-3">
              <span className="font-bold text-sm">
                {t("admin.admin_panel.order_page.comments")}:
              </span>
              <span className="text-sm text-gray-600">{order.comments}</span>
            </div>
          </div>
        </>
      )}
      {isPubLoading && <BlackSpinner />}
    </div>
  );
};

export default OrderInfoPage;
