"use client";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { selectOrders } from "../Orders/ordersSlice";
import { useSetShippingAvailabilityMutation } from "@/api/pub/pub";
import { useGetEstimatedPreparingMinutesQuery } from "@/api/orders/orders";
import { Card, SectionLabel } from "@/components/design/Card";
import { orderStatuses, orderTypes, currencies } from "@/static-data/data";
import { getOrderColor } from "@/utils/order-utils";
import { GetUtcDateFromApiTime } from "@/utils/time";
import usePageTitle from "@/hooks/usePageTitle";
import {
    ChevronRightIcon,
    TrendUpIcon,
    TrendDownIcon,
    AlertIcon,
    DeliveryIcon,
    InPlaceIcon,
    MenuGridIcon,
    DeliveryFlagIcon,
    OrdersBoxIcon,
    SettingsGearIcon,
} from "./icons";

const NOT_ACKNOWLEDGED_MINUTES = 5;
const OVERDUE_BUFFER_MINUTES = 5;

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const cardLinkStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1px solid #e4e9ee",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(20,30,45,.04)",
    padding: 14,
    textDecoration: "none",
    color: "#1c2733",
};

// Real dashboard replacing the old tile-grid Sections.jsx, built with the
// same Card/SectionLabel primitives and palette as the order-detail/shipping
// redesign. Stats/chart/needs-attention are all computed client-side from
// the `orders` array already loaded via the pub's WebSocket feed - no new
// backend endpoint, see the approved plan. The POS "Новый заказ · касса"
// card from the mockup is deliberately not here yet - it needs a real cart,
// which doesn't exist anywhere in this codebase, and is its own follow-up.
const Home = ({ pub, companyID }) => {
    const { t, i18n } = useTranslation();
    usePageTitle(t("admin.admin_panel.main_page.headline"));

    const rawOrders = useSelector(selectOrders);
    const orders = useMemo(() => rawOrders ?? [], [rawOrders]);

    const [setShippingAvailability, { isLoading: isTogglingAvailability }] =
        useSetShippingAvailabilityMutation();

    const { data: estimateData } = useGetEstimatedPreparingMinutesQuery(
        { companyID, pubID: pub?.id },
        { skip: !companyID || !pub?.id }
    );
    const estimatedMinutes = estimateData?.sample_count > 0 ? estimateData.minutes : null;

    const currencySymbol =
        currencies.find((currency) => currency.id === pub?.currency_id)?.symbol ?? "Lei";
    const locale = i18n.language === "ro" ? "ro-RO" : "ru-RU";

    const nonCanceled = useMemo(
        () => orders.filter((order) => order.status !== orderStatuses.canceled),
        [orders]
    );

    const stats = useMemo(() => {
        const now = new Date();
        const todayKey = dayKey(now);

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayKey = dayKey(yesterday);

        let revenueToday = 0;
        let ordersTodayCount = 0;
        let inProgressToday = 0;
        let revenueYesterday = 0;
        let revenueLast7 = 0;
        let ordersLast7 = 0;

        const dayBuckets = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - (6 - i));
            dayBuckets.set(dayKey(d), { date: d, revenue: 0 });
        }

        for (const order of nonCanceled) {
            const created = GetUtcDateFromApiTime(order.created_time);
            const revenue = order.total_dishes_price_without_commission || 0;
            const key = dayKey(created);

            if (created >= sevenDaysAgo) {
                revenueLast7 += revenue;
                ordersLast7 += 1;
                if (dayBuckets.has(key)) {
                    dayBuckets.get(key).revenue += revenue;
                }
            }

            if (key === todayKey) {
                revenueToday += revenue;
                ordersTodayCount += 1;
                if (
                    order.status === orderStatuses.notHandled ||
                    order.status === orderStatuses.preparing ||
                    order.status === orderStatuses.atCourier
                ) {
                    inProgressToday += 1;
                }
            } else if (key === yesterdayKey) {
                revenueYesterday += revenue;
            }
        }

        const revenueTrendPercent =
            revenueYesterday > 0 ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100) : null;

        return {
            revenueToday,
            ordersTodayCount,
            inProgressToday,
            revenueTrendPercent,
            averageCheck: ordersLast7 > 0 ? revenueLast7 / ordersLast7 : 0,
            chart: Array.from(dayBuckets.values()),
        };
    }, [nonCanceled]);

    const attentionOrders = useMemo(() => {
        const nowMs = Date.now();
        const list = [];

        for (const order of orders) {
            if (order.status === orderStatuses.notHandled) {
                const ageMinutes = (nowMs - GetUtcDateFromApiTime(order.created_time).getTime()) / 60000;
                if (ageMinutes > NOT_ACKNOWLEDGED_MINUTES) {
                    list.push({
                        order,
                        text: `№${order.id} ${t("admin.home.not_acknowledged", { minutes: Math.round(ageMinutes) })}`,
                    });
                }
            } else if (order.status === orderStatuses.preparing && estimatedMinutes) {
                const ageMinutes = (nowMs - GetUtcDateFromApiTime(order.created_time).getTime()) / 60000;
                if (ageMinutes > estimatedMinutes + OVERDUE_BUFFER_MINUTES) {
                    list.push({ order, text: `№${order.id} ${t("admin.home.taking_longer")}` });
                }
            }
        }

        return list;
    }, [orders, estimatedMinutes, t]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort(
                (a, b) =>
                    GetUtcDateFromApiTime(b.created_time).getTime() -
                    GetUtcDateFromApiTime(a.created_time).getTime()
            )
            .slice(0, 5);
    }, [orders]);

    const isShippingAvailable = !!pub?.shipping?.available;

    const handleTogglePause = () => {
        if (!companyID || !pub?.id || isTogglingAvailability) return;
        setShippingAvailability({ companyID, pubID: pub.id, available: !isShippingAvailable });
    };

    if (!pub) return null;

    const maxChartRevenue = Math.max(1, ...stats.chart.map((day) => day.revenue));

    const pauseKnob = (
        <div
            style={{
                width: 36,
                height: 20,
                borderRadius: 20,
                background: isShippingAvailable ? "#1a9e6b" : "#cbd3da",
                display: "flex",
                alignItems: "center",
                padding: 2,
                justifyContent: isShippingAvailable ? "flex-end" : "flex-start",
                transition: "background .15s",
                flexShrink: 0,
            }}
        >
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
        </div>
    );

    return (
        <div className="mx-auto w-full max-w-[620px] lg:max-w-[1080px] flex flex-col gap-3.5" style={{ padding: "0 8px 40px" }}>
            {/* Desktop page header: title + compact pause pill - mobile gets
                the pub name from the top bar instead, and the pause toggle
                as its own full-width bar below. */}
            <div className="hidden lg:flex items-center justify-between">
                <div style={{ fontSize: 20, fontWeight: 700 }}>{t("admin.admin_panel.main_page.headline")}</div>
                <button
                    type="button"
                    onClick={handleTogglePause}
                    disabled={isTogglingAvailability}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: isShippingAvailable ? "#e5f6ee" : "#f2f4f6",
                        padding: "6px 12px",
                        borderRadius: 20,
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: isShippingAvailable ? "#1a9e6b" : "#94a3b0" }}>
                        {t(isShippingAvailable ? "admin.home.orders_accepting_on" : "admin.home.orders_accepting_off")}
                    </span>
                    {pauseKnob}
                </button>
            </div>

            {/* Mobile pause toggle - full-width bar */}
            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={handleTogglePause}
                    disabled={isTogglingAvailability}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        background: isShippingAvailable ? "#e5f6ee" : "#f7f8fa",
                        border: "1px solid #e4e9ee",
                        borderRadius: 14,
                        padding: "10px 16px",
                        cursor: "pointer",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isShippingAvailable ? "#1a9e6b" : "#94a3b0",
                        }}
                    >
                        {t(isShippingAvailable ? "admin.home.orders_accepting_on" : "admin.home.orders_accepting_off")}
                    </span>
                    {pauseKnob}
                </button>
            </div>

            {/* Needs attention - only renders when there's something to flag */}
            {attentionOrders.length > 0 && (
                <NavLink
                    to={`/admin/pub/${pub.id}/orders`}
                    style={{ ...cardLinkStyle, borderColor: "#f5c78a", background: "#fff8ef" }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "rgba(242,153,74,.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <AlertIcon stroke="#f2994a" />
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                            {t("admin.home.needs_attention", { count: attentionOrders.length })}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#526070", marginTop: 1 }}>
                            {attentionOrders.map((item) => item.text).join(" · ")}
                        </div>
                    </div>
                    <ChevronRightIcon stroke="#94a3b0" style={{ flexShrink: 0 }} />
                </NavLink>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 10 }}>
                <Card style={{ gap: 4, padding: 14 }}>
                    <SectionLabel>{t("admin.home.revenue_today")}</SectionLabel>
                    <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>
                        {Math.round(stats.revenueToday).toLocaleString(locale)}{" "}
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#526070" }}>{currencySymbol}</span>
                    </div>
                    {stats.revenueTrendPercent !== null && (
                        <div className="flex items-center" style={{ gap: 3 }}>
                            {stats.revenueTrendPercent >= 0 ? (
                                <TrendUpIcon stroke="#1a9e6b" />
                            ) : (
                                <TrendDownIcon stroke="#e0483a" />
                            )}
                            <span style={{ fontSize: 11, fontWeight: 600, color: stats.revenueTrendPercent >= 0 ? "#1a9e6b" : "#e0483a" }}>
                                {stats.revenueTrendPercent >= 0 ? "+" : ""}
                                {stats.revenueTrendPercent}%
                            </span>
                            <span style={{ fontSize: 10.5, color: "#94a3b0" }}>{t("admin.home.vs_yesterday")}</span>
                        </div>
                    )}
                </Card>
                <Card style={{ gap: 4, padding: 14 }}>
                    <SectionLabel>{t("admin.home.orders_today")}</SectionLabel>
                    <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{stats.ordersTodayCount}</div>
                    {stats.inProgressToday > 0 && (
                        <div style={{ fontSize: 11, color: "#526070" }}>
                            {t("admin.home.in_progress", { count: stats.inProgressToday })}
                        </div>
                    )}
                </Card>
                <Card style={{ gap: 4, padding: 14 }}>
                    <SectionLabel>{t("admin.home.average_check")}</SectionLabel>
                    <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>
                        {Math.round(stats.averageCheck).toLocaleString(locale)}{" "}
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#526070" }}>{currencySymbol}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b0" }}>{t("admin.home.last_7_days")}</div>
                </Card>
                <Card style={{ gap: 4, padding: 14 }}>
                    <SectionLabel>{t("admin.home.average_prep_time")}</SectionLabel>
                    <div className="num" style={{ fontSize: 20, fontWeight: 700, color: "#2D7DD2" }}>
                        {estimatedMinutes ? Math.round(estimatedMinutes) : "—"}{" "}
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#526070" }}>
                            {t("admin.admin_panel.order_page.minutes_shortcut")}
                        </span>
                    </div>
                </Card>
            </div>

            {/* 7-day revenue chart */}
            <Card>
                <SectionLabel>{t("admin.home.revenue_7_days")}</SectionLabel>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110, paddingTop: 6 }}>
                    {stats.chart.map((day, index) => {
                        const isToday = index === stats.chart.length - 1;
                        const heightPercent = Math.max(4, (day.revenue / maxChartRevenue) * 100);
                        return (
                            <div
                                key={dayKey(day.date)}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 6,
                                    height: "100%",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: `${heightPercent}%`,
                                        borderRadius: "6px 6px 0 0",
                                        background: isToday ? "#2D7DD2" : "#e8f1fb",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: isToday ? "#1c2733" : "#94a3b0",
                                        fontWeight: isToday ? 700 : 400,
                                    }}
                                >
                                    {day.date.toLocaleDateString(locale, { weekday: "short" })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Recent orders */}
            <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SectionLabel>{t("admin.home.recent_orders")}</SectionLabel>
                    <NavLink to={`/admin/pub/${pub.id}/orders`} style={{ fontSize: 12.5, fontWeight: 600, color: "#2D7DD2" }}>
                        {t("admin.home.all_orders")} →
                    </NavLink>
                </div>
                {recentOrders.length === 0 && (
                    <div style={{ fontSize: 13, color: "#94a3b0" }}>{t("admin.home.no_orders_yet")}</div>
                )}
                {recentOrders.map((order, index) => {
                    const isDelivery = order.order_type === orderTypes.delivery;
                    const statusColor = getOrderColor(order.status);
                    return (
                        <div key={order.id}>
                            <NavLink
                                to={`/admin/pub/${pub.id}/order/${order.id}`}
                                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#1c2733" }}
                            >
                                <span
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        background: `${statusColor}20`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isDelivery ? (
                                        <DeliveryIcon stroke={statusColor} />
                                    ) : (
                                        <InPlaceIcon stroke={statusColor} />
                                    )}
                                </span>
                                <div style={{ flexGrow: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                                        №{order.id}{" "}
                                        <span style={{ fontWeight: 500, color: "#94a3b0", fontSize: 11 }}>
                                            · {t(isDelivery ? "admin.home.order_type_delivery" : "admin.home.order_type_in_place")}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11.5, color: "#526070" }}>
                                        {t(`admin.admin_panel.order_page.order_statuses.${order.status}`)}
                                    </div>
                                </div>
                                <span className="num" style={{ fontSize: 13.5, fontWeight: 600 }}>
                                    {Math.round((order.total_dishes_price_without_commission || 0) + (order.delivery_price || 0))}{" "}
                                    {currencySymbol}
                                </span>
                            </NavLink>
                            {index < recentOrders.length - 1 && (
                                <hr style={{ border: "none", borderTop: "1px solid #e4e9ee", margin: "10px 0" }} />
                            )}
                        </div>
                    );
                })}
            </Card>

            {/* Section nav - mobile only, the sidebar covers this on lg+ */}
            <div className="lg:hidden">
                <SectionLabel>{t("admin.home.sections")}</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                    <NavLink to={`/admin/pub/${pub.id}/edit_menu`} style={cardLinkStyle}>
                        <MenuGridIcon stroke="#2D7DD2" />
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("admin.home.nav_menu")}</span>
                    </NavLink>
                    <NavLink to={`/admin/pub/${pub.id}/shipping`} style={cardLinkStyle}>
                        <DeliveryFlagIcon stroke="#2D7DD2" />
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("admin.home.nav_shipping")}</span>
                    </NavLink>
                    <NavLink to={`/admin/pub/${pub.id}/orders`} style={cardLinkStyle}>
                        <OrdersBoxIcon stroke="#2D7DD2" />
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("admin.home.nav_orders")}</span>
                    </NavLink>
                    <NavLink to={`/admin/pub/${pub.id}/settings`} style={cardLinkStyle}>
                        <SettingsGearIcon stroke="#2D7DD2" />
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("admin.home.nav_settings")}</span>
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Home;
