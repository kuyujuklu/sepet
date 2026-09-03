import { useDispatch, useSelector } from "react-redux";
import { selectOrders, setDeleteFromOrderDishPopupState } from "../ordersSlice";
import { useEffect, useMemo, useState } from "react";
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
import AddDishToOrderButton from "./AddDishToOrderButton";
import { useUpdateOrderDishesMutation } from "../../../../api/orders/orders";
import OrderCourierInfo from "../OrderCourierInfo";
import { deliveryTypes } from "../../../../static-data/data";
import { ConvertQrMenuApiTimeToLocal } from "../../../../utils/time";
import { getOrderColor, getOrderColorTint } from "../../../../utils/order-utils";
import { Card, SectionLabel, SoonChip, SoonCard } from "@/components/design/Card";
import PageHeader from "@/components/design/PageHeader";
import { PhoneIcon, PinIcon, MessageIcon, PrinterIcon, CourierMapIcon, CancelReasonIcon, SwapIcon } from "./icons";
import EstimatedReadyCard from "./EstimatedReadyCard";
import OrderTimeline from "./OrderTimeline";
import usePageTitle from "@/hooks/usePageTitle";

const OrderInfoPage = ({ pubUrlName }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const orderID = +useParams().orderID;
  const orders = useSelector(selectOrders);

  const order = useMemo(() => {
    if (!orderID || !orders) return null;

    const order = orders.find((item) => item.id === orderID);
    return order ?? null;
  }, [orderID, orders]);

  usePageTitle(order ? `${t("admin.admin_panel.order_page.order")} №${order.id}` : undefined);

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

  // order.dishes entries are {dish_id, count, dish_price} (the read shape) -
  // the backend's update-dishes only understands a `price` field, so a
  // resend that just forwards dish_price verbatim silently gets ignored,
  // and every untouched position quietly resets to the pub's *current* menu
  // price instead of keeping what the order was actually placed at. Mapping
  // dish_price -> price here is what keeps a delete (or the price edit
  // below) from side-effecting every other line on the order.
  const toDishInput = (dish) => ({
    dish_id: dish.dish_id,
    count: dish.count,
    price: dish.dish_price,
  });

  const deletePosition = (dishID) => {
    if (
      !dishID ||
      !pubData?.pub.id ||
      !pubUrlName ||
      !pubData?.pub?.company_id
    ) {
      return;
    }
    const newDishes = order?.dishes
      .filter((dish) => dish.dish_id !== dishID)
      .map(toDishInput);

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

  const [updateDishes, { isLoading: isUpdatingDishPrice }] =
    useUpdateOrderDishesMutation();
  const [editingDishID, setEditingDishID] = useState(null);

  const savePositionPrice = (dishID, newPrice) => {
    const companyID = pubData?.pub?.company_id;
    const pubID = pubData?.pub?.id;
    if (!companyID || !pubID || !orderID || !order?.dishes || isNaN(+newPrice)) return;

    const newDishes = order.dishes.map((dish) =>
      dish.dish_id === dishID
        ? { dish_id: dish.dish_id, count: dish.count, price: +newPrice }
        : toDishInput(dish)
    );

    updateDishes({ orderID, pubID, companyID, dishes: newDishes }).then(() => {
      setEditingDishID(null);
    });
  };

  const zoneLabel = useMemo(() => {
    const shapes = pubData?.pub?.shipping?.shapes;
    if (!order?.shape_id || !shapes) return null;

    const index = shapes.findIndex((shape) => shape.shape_id === order.shape_id);
    if (index === -1) return null;

    return t("admin.admin_panel.shipping.shipping_map.zone_label", { number: index + 1 });
  }, [order?.shape_id, pubData?.pub?.shipping?.shapes, t]);

  const paymentTypeLabel =
    order?.payment_type === "cash"
      ? t("admin.admin_panel.order_page.order_payment_types.cash")
      : order?.payment_type === "card_offline"
        ? t("admin.admin_panel.order_page.order_payment_types.card_offline")
        : t("admin.admin_panel.order_page.order_payment_types.not_proceeded");

  return (
    <div className="flex flex-col items-center m-auto w-full" style={{ background: "#f5f7fa" }}>
      {!order && (
        <span className="font-bold text-lg mt-6">
          {t("admin.admin_panel.order_page.order_not_found")}
        </span>
      )}
      {order && pubData && (
        <div
          className="px-4 py-4 w-full flex flex-col gap-3.5"
          style={{ maxWidth: "1080px" }}
        >
          <PageHeader
            title={`${t("admin.admin_panel.order_page.order")} №${order?.id}`}
            subtitle={ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
            backTo={`/admin/pub/${pubData?.pub?.id}/orders`}
            right={
              <div
                className="flex items-center gap-1.5 h-[26px] px-3 rounded-full text-[13px] font-semibold"
                style={{ background: getOrderColorTint(order?.status), color: getOrderColor(order?.status) }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: getOrderColor(order?.status) }} />
                {t(`admin.admin_panel.order_page.order_statuses.${order?.status ?? "not_handled"}`)}
              </div>
            }
          />

          {order?.client_name === "delivery order from web menu" && order?.main_phone_number && (
            <a
              href={`tel:${order.main_phone_number}`}
              className="w-full rounded-xl px-4 py-2.5 text-white text-[14px] font-semibold text-center block"
              style={{ background: "#e0483a" }}
            >
              Обзвонить клиента
            </a>
          )}

          {pubData?.pub?.shipping?.delivery_type === deliveryTypes.deliveryService && (
            <OrderCourierInfo order={order} />
          )}

          {/* Status/timeline/customer on the left, dishes/price on the
              right at desktop widths - matches the canvas mockup's
              two-column order-detail layout; a plain stack below lg. */}
          <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-5 lg:items-start">
          <div className="flex flex-col gap-3.5 min-w-0">

          {/* Status */}
          <Card>
            <SectionLabel>{t("admin.admin_panel.order_page.order_status_label")}</SectionLabel>
            <OrderStatuses
              companyID={pubData?.pub?.company_id}
              pubID={pubData?.pub?.id}
              orderID={orderID}
              status={order.status}
            />
          </Card>

          <EstimatedReadyCard
            companyID={pubData?.pub?.company_id}
            pubID={pubData?.pub?.id}
            orderID={orderID}
            status={order.status}
            shapeID={order?.shape_id}
            zoneLabel={zoneLabel}
          />

          <OrderTimeline
            companyID={pubData?.pub?.company_id}
            pubID={pubData?.pub?.id}
            orderID={orderID}
            status={order.status}
          />

          {/* Customer & delivery */}
          <Card>
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>{t("admin.admin_panel.order_page.customer_and_delivery")}</SectionLabel>
              <SoonChip />
            </div>

            {order.order_type === orderTypes.delivery && (
              <>
                <div className="flex items-start gap-2.5">
                  <PhoneIcon className="text-muted-2 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-ink">{order.main_phone_number}</div>
                    {order.second_phone_number && (
                      <div className="text-[12.5px] text-muted">{order.second_phone_number}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <PinIcon className="text-muted-2 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-ink">{order.full_address}</div>
                    <div className="text-[12.5px] text-muted">{order.town}</div>
                  </div>
                </div>
              </>
            )}
            {order.order_type === orderTypes.inPlace && (
              <div className="text-[14px] text-ink">
                <span className="font-semibold">{t("admin.admin_panel.order_page.table_number")}:</span>{" "}
                {order.table_for_in_place_order}
              </div>
            )}
          </Card>

          </div>

          <div className="flex flex-col gap-3.5 min-w-0">

          {/* Dishes */}
          <Card>
            <SectionLabel>{t("admin.admin_panel.order_page.order_items")}</SectionLabel>
            {shownDishes && (
              <div className="flex flex-col gap-3.5">
                {shownDishes.map((item, index) => (
                  <div key={item.dish?.id}>
                    <OrderPosition
                      deletePosition={() => deletePosition(item.dish?.id)}
                      pub={pubData?.pub}
                      dish={item.dish}
                      count={item.count}
                      fixedPrice={item.fixedPrice}
                      isEditingPrice={editingDishID === item.dish?.id}
                      onStartEditPrice={() => setEditingDishID(item.dish?.id)}
                      onCancelEditPrice={() => setEditingDishID(null)}
                      onSavePrice={(newPrice) => savePositionPrice(item.dish?.id, newPrice)}
                      isSavingPrice={isUpdatingDishPrice && editingDishID === item.dish?.id}
                    />
                    {index < shownDishes.length - 1 && (
                      <hr className="mt-3.5" style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />
                    )}
                  </div>
                ))}
              </div>
            )}
            <AddDishToOrderButton
              currentDishes={order?.dishes}
              pubUrlName={pubUrlName}
              pubID={pubData?.pub?.id}
              companyID={pubData?.pub?.company_id}
              orderID={orderID}
            />
          </Card>

          <SoonCard
            icon={SwapIcon}
            title={t("admin.admin_panel.order_page.soon.item_substitute_title")}
            desc={t("admin.admin_panel.order_page.soon.item_substitute_desc")}
          />

          {/* Price summary */}
          {shownDishes && (
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">
                  {t("admin.admin_panel.order_page.total_price_of_products")}
                </span>
                <span className="text-[14px] font-medium text-ink tabular-nums">
                  {(pubData?.pub?.shipping?.add_commission_to_dish_prices
                    ? orderItemsPrice / 1.1
                    : orderItemsPrice
                  ).toFixed(2)} Lei
                </span>
              </div>

              {pubData?.pub?.shipping?.add_commission_to_dish_prices && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted">
                    {t("admin.admin_panel.order_page.commission")}
                  </span>
                  <span className="text-[14px] font-medium text-ink tabular-nums">
                    {(orderItemsPrice - orderItemsPrice / 1.1).toFixed(2)} Lei
                  </span>
                </div>
              )}

              {order.order_type === orderTypes.delivery && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted">
                      {t("admin.admin_panel.order_page.price_of_shipping")}
                    </span>
                    <span className="text-[14px] font-medium text-ink tabular-nums">
                      {order.delivery_price} Lei
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted">
                      {t("admin.admin_panel.order_page.payment_type")}
                    </span>
                    <span className="text-[14px] font-medium text-ink">
                      {paymentTypeLabel}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2" style={{ background: "#f2f0fd" }}>
                <span className="text-[12px] font-semibold" style={{ color: "#8b7cf6" }}>
                  {t("admin.admin_panel.order_page.soon.commission_breakdown")}
                </span>
                <SoonChip />
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-ink">
                  {t("admin.admin_panel.order_page.final_price")}
                </span>
                <span className="text-[22px] font-bold text-ink tabular-nums">
                  {finalPrice.toFixed(2)} Lei
                </span>
              </div>
            </Card>
          )}

          {/* Comments */}
          {order.comments && (
            <Card>
              <div className="flex items-center gap-2.5">
                <MessageIcon className="text-muted-2" />
                <SectionLabel>{t("admin.admin_panel.order_page.comments")}</SectionLabel>
              </div>
              <div className="text-[14px] text-ink leading-relaxed">{order.comments}</div>
            </Card>
          )}

          {/* Soon on this screen */}
          <div className="flex flex-col gap-2.5 mt-1">
            <SectionLabel color="#8b7cf6">
              {t("admin.admin_panel.order_page.soon.on_this_screen")}
            </SectionLabel>
            <SoonCard icon={PrinterIcon} title={t("admin.admin_panel.order_page.soon.print_receipt")} />
            <SoonCard
              icon={CourierMapIcon}
              title={t("admin.admin_panel.order_page.soon.courier_map_title")}
              desc={t("admin.admin_panel.order_page.soon.courier_map_desc")}
            />
            <SoonCard icon={CancelReasonIcon} title={t("admin.admin_panel.order_page.soon.cancel_reason")} />
          </div>

          </div>
          </div>
        </div>
      )}
      {isPubLoading && <BlackSpinner />}
    </div>
  );
};

export default OrderInfoPage;
