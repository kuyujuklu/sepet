import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectOrders } from "./ordersSlice";
import OrderCard from "./OrderCard";
import { GetUtcDateFromApiTime } from "@/utils/time";
import { NavLink, useParams } from "react-router-dom";
import { orderStatuses } from "../../../static-data/data";
import { useTranslation } from "react-i18next";
import OrdersFilter, { orderFilters } from "./OrdersFilter";
import usePageTitle from "@/hooks/usePageTitle";
import PageHeader from "@/components/design/PageHeader";

const Orders = () => {
    const { t } = useTranslation();
    usePageTitle(t("admin.admin_panel.orders_page.headline"));
    const orders = useSelector(selectOrders);
    const pubID = useParams().pubID;

    // Local UI state, not a navigation step - switching filters used to go
    // through navigate(null, {state}), which pushed a new history entry per
    // click, so the back button walked through every filter you'd ever
    // clicked before it would actually leave the page.
    const [ordersFilter, setOrdersFilter] = useState(orderFilters.all);


    const sortedOrders = useMemo(() => {
        const ordersNotFiltered = JSON.parse(JSON.stringify(orders));
        if (!ordersNotFiltered) return [];

        const filtered = ordersNotFiltered.filter(
            (order) =>
                (ordersFilter === orderFilters.all &&
                    order.status !== orderStatuses.canceled && order.status !== orderStatuses.completed) ||
                order.status === ordersFilter
        );

        filtered.sort(
            (a, b) =>
                GetUtcDateFromApiTime(b.created_time).getTime() -
                GetUtcDateFromApiTime(a.created_time).getTime()
        );

        return filtered;
    }, [orders, ordersFilter]);

    const notCompletedOrders = useMemo(() => {
        if (!orders) return 0;
        return orders.reduce(
            (acc, item) =>
                acc +
                (item.status !== orderStatuses.completed &&
                item.status !== orderStatuses.canceled
                    ? 1
                    : 0),
            0
        );
    }, [orders]);

    return (
        <div className="mx-auto w-full max-w-[620px] lg:max-w-[1080px] flex flex-col gap-4" style={{ padding: "16px 8px 40px" }}>
            <PageHeader title={t("admin.admin_panel.orders_page.headline")} backTo={`/admin/pub/${pubID}`} />

            <div className="flex items-center justify-between flex-wrap gap-3">
                <OrdersFilter
                    ordersFilter={ordersFilter ?? orderFilters.all}
                    setOrdersFilter={setOrdersFilter}
                />
                <div style={{ fontSize: 13, color: "#526070" }}>
                    {t("admin.admin_panel.orders_page.active_orders")}:{" "}
                    <span style={{ fontWeight: 700, color: "#1c2733" }}>{notCompletedOrders}</span>
                </div>
            </div>

            {(!sortedOrders || sortedOrders?.length === 0) && (
                <div style={{ fontSize: 14, color: "#94a3b0" }}>
                    {t("admin.admin_panel.orders_page.no_orders")}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 14 }}>
                {sortedOrders?.map((item) => (
                    <NavLink key={item.id} to={`/admin/pub/${item.pub_id}/order/${item.id}`}>
                        <OrderCard order={item} />
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Orders;
