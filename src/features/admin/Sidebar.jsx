import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLazyLogoutQuery } from "@/api/auth/authQuery";
import { useGetPubsQuery } from "@/api/pub/pub";
import { setLastUsedPubID } from "@/utils/lastUsedPub";
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice";
import {
    ChevronDownIcon,
    HouseIcon,
    OrdersBoxIcon,
    MenuGridIcon,
    DeliveryFlagIcon,
    SettingsGearIcon,
} from "./Home/icons";

const navItemStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 600,
    color: active ? "#2D7DD2" : "#526070",
    background: active ? "#e8f1fb" : "transparent",
});

// Persistent left-nav shell for wide screens (>=lg), replacing the old
// top bar there: a pub switcher up top (doubling as the way to log out -
// always clickable, not just when there's more than one pub to switch to)
// and the five main sections below. Mobile keeps its own equivalent header
// (Header.jsx) - this isn't rendered below lg.
const Sidebar = ({ pub, pubID, companyID }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const dispatch = useDispatch();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const { data: pubsData } = useGetPubsQuery({ companyID }, { skip: !companyID });
    const pubs = pubsData?.pubs ?? [];
    const hasMultiplePubs = pubs.length > 1;

    const [logoutQuery, { data: logoutData, error: logoutError }] = useLazyLogoutQuery();

    useEffect(() => {
        dispatch(setReceivingError({ errorKey: errorKeys.logout, error: logoutError }));
    }, [dispatch, logoutError]);

    useEffect(() => {
        if (!logoutData?.ok) return;
        window.location.pathname = "/";
    }, [logoutData]);

    const isShippingAvailable = !!pub?.shipping?.available;
    const initials = (pub?.name ?? "").trim().slice(0, 2).toUpperCase() || "?";
    const basePath = `/admin/pub/${pubID}`;

    const isActive = (segment) => {
        if (segment === "") {
            return location.pathname === basePath || location.pathname === `${basePath}/`;
        }
        return location.pathname.startsWith(`${basePath}/${segment}`);
    };

    return (
        <div
            style={{
                width: 220,
                flexShrink: 0,
                background: "#fff",
                border: "1px solid #e4e9ee",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
                padding: "20px 14px",
                gap: 4,
                position: "sticky",
                top: 20,
                minHeight: "calc(100vh - 40px)",
            }}
        >
            <div style={{ position: "relative", paddingBottom: 18 }}>
                <button
                    type="button"
                    onClick={() => setSwitcherOpen((open) => !open)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "0 8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: "#e8f1fb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#2D7DD2",
                            fontSize: 14,
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </div>
                    <div style={{ minWidth: 0, flexGrow: 1, textAlign: "left" }}>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#1c2733",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {pub?.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: isShippingAvailable ? "#1a9e6b" : "#94a3b0" }}>
                            {t(isShippingAvailable ? "admin.home.sidebar_open" : "admin.home.sidebar_closed")}
                        </div>
                    </div>
                    <ChevronDownIcon stroke="#94a3b0" style={{ flexShrink: 0 }} />
                </button>

                {switcherOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 8,
                            right: 8,
                            marginTop: 6,
                            background: "#fff",
                            border: "1px solid #e4e9ee",
                            borderRadius: 12,
                            boxShadow: "0 8px 20px rgba(20,30,45,.14)",
                            zIndex: 30,
                            overflow: "hidden",
                        }}
                    >
                        {hasMultiplePubs && (
                            <>
                                {pubs.map((otherPub) => (
                                    <NavLink
                                        key={otherPub.id}
                                        to={`/admin/pub/${otherPub.id}`}
                                        onClick={() => {
                                            setLastUsedPubID(companyID, otherPub.id);
                                            setSwitcherOpen(false);
                                        }}
                                        style={{
                                            display: "block",
                                            padding: "10px 12px",
                                            fontSize: 13.5,
                                            fontWeight: String(otherPub.id) === String(pubID) ? 700 : 500,
                                            color: String(otherPub.id) === String(pubID) ? "#2D7DD2" : "#1c2733",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {otherPub.name}
                                    </NavLink>
                                ))}
                                <hr style={{ border: "none", borderTop: "1px solid #e4e9ee", margin: 0 }} />
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => logoutQuery()}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "10px 12px",
                                fontSize: 13.5,
                                fontWeight: 500,
                                color: "#e0483a",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {t("admin.logout")}
                        </button>
                    </div>
                )}
            </div>

            <NavLink to={basePath} style={navItemStyle(isActive(""))}>
                <HouseIcon />
                {t("admin.home.nav_home")}
            </NavLink>
            <NavLink to={`${basePath}/orders`} style={navItemStyle(isActive("orders") || isActive("order"))}>
                <OrdersBoxIcon />
                {t("admin.home.nav_orders")}
            </NavLink>
            <NavLink to={`${basePath}/edit_menu`} style={navItemStyle(isActive("edit_menu"))}>
                <MenuGridIcon />
                {t("admin.home.nav_menu")}
            </NavLink>
            <NavLink to={`${basePath}/shipping`} style={navItemStyle(isActive("shipping"))}>
                <DeliveryFlagIcon />
                {t("admin.home.nav_shipping")}
            </NavLink>
            <NavLink to={`${basePath}/settings`} style={navItemStyle(isActive("settings"))}>
                <SettingsGearIcon />
                {t("admin.home.nav_settings")}
            </NavLink>
        </div>
    );
};

export default Sidebar;
