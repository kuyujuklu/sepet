import { useDispatch, useSelector } from "react-redux";
import { selectOrders } from "../ordersSlice";
import { useEffect, useMemo } from "react";
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

const OrderInfoPage = ({ pubUrlName }) => {
    const {t} = useTranslation()
    const dispatch = useDispatch();
    const orderID = +useParams().orderID;
    const orders = useSelector(selectOrders);

    const order = useMemo(() => {
        if (!orderID || !orders) return null;
        
        const order = orders.find((item) => item.id === orderID);
        console.log("order: ", order)
        return order ?? null;
    }, [orderID, orders]);

    const {
        data: pubData,
        error: pubError,
        isLoading: isPubLoading,
    } = useGetFullPubInfoQuery(
        { pubUrlName: pubUrlName },
        { skip: !pubUrlName }
    );

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
        const dishCounts = order?.dishes?.reduce((acc, item) => {
            acc[item.dish_id] = item.count;
            return acc;
        }, {});

        if (!dishCounts || !pubData?.dishes) return;

        const shownDishes = pubData?.dishes
            ?.map((item) =>
                dishCounts[item.id]
                    ? { dish: item, count: dishCounts[item.id] }
                    : false
            )
            .filter((item) => !!item);

        return shownDishes;
    }, [order?.dishes, pubData]);

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

                        <div className="mb-6">
                            <OrderStatuses
                                companyID={pubData?.pub?.company_id}
                                pubID={pubData?.pub?.id}
                                orderID={orderID}
                                status={order.status}
                            />
                        </div>

                        <div className="grid grid-cols-2 w-full px-10 mb-10">
                            {order.order_type === orderTypes.delivery && (
                                <>
                                    <div>
                                        <span className="font-bold">{t("admin.admin_panel.order_page.town")}:</span>{" "}
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
                                        <span>{order.payment_type}</span>
                                    </div>
                                </>
                            )}
                            {order.order_type === orderTypes.inPlace && (
                                <>
                                    <div>
                                        <span className="font-bold">
                                        {t("admin.admin_panel.order_page.table_number")}:
                                        </span>{" "}
                                        <span>
                                            {order.table_for_in_place_order}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {shownDishes &&
                            shownDishes.map((item, index) => (
                                <div
                                    key={item.dish.id}
                                    className="w-full gap-x-2 grid grid-cols-12 items-center"
                                >
                                    <div className="col-span-1">
                                        {index + 1}.
                                    </div>
                                    <div className="col-span-11">
                                        <OrderPosition
                                            pub={pubData?.pub}
                                            dish={item.dish}
                                            count={item.count}
                                        />
                                    </div>
                                </div>
                            ))}
                        <div className="flex flex-col w-full px-16 justify-start mt-3">
                            <span className="font-bold text-sm">{t("admin.admin_panel.order_page.comments")}:</span>
                            <span className="text-sm text-gray-600">
                                {order.comments}
                            </span>
                        </div>
                    </div>
                </>
            )}
            {isPubLoading && <BlackSpinner />}
        </div>
    );
};

export default OrderInfoPage;
