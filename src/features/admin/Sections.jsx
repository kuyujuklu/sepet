import { NavLink } from "react-router-dom";
import PinPubsGeolocation from "./PinPubsGeolocation";
import { useDispatch, useSelector } from "react-redux";
import { selectOrders } from "./Orders/ordersSlice";
import { useMemo } from "react";
import { orderStatuses } from "../../static-data/data";
import { useTranslation } from "react-i18next";
import { openUpdatePubPopup } from "../pub/pubSlice";

const Sections = ({ pub }) => {
    const { t } = useTranslation();
    return (
        <div
            style={{ maxWidth: "1000px" }}
            className="m-auto flex justify-center flex-wrap gap-10"
        >
            {pub && (
                <>
                    {/* Orders */}
                    <OrdersSection pubID={pub.id} />
                    {/* Edit menu */}
                    <NavLink
                        to={`/admin/pub/${pub.id}/edit_menu`}
                        style={{ display: "block", width: "250px" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "300px",
                                maxWidth: "250px",
                                transition: "all .3s ease-in-out",
                            }}
                            className="flex flex-col justify-between relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
                        >
                            <span className="text-center text-xl font-bold">
                                {t(
                                    "admin.admin_panel.main_page.sections.edit_menu.headline"
                                )}
                            </span>
                            <div className="relative" style={{ flex: "1" }}>
                                <img
                                    style={{
                                        height: "100%",
                                        objectFit: "scale-down",
                                    }}
                                    className="absolute inset-0 m-auto"
                                    src="/static/admin/images/png/menu-in-phone.png"
                                    alt="food shipping image"
                                />
                            </div>
                        </div>
                    </NavLink>
                    {/* Pin pubs geolocation */}
                    <PinPubsGeolocation />
                    {/* Food shipping */}
                    <NavLink
                        to={`/admin/pub/${pub.id}/shipping`}
                        style={{ display: "block", width: "250px" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "300px",
                                maxWidth: "250px",
                                transition: "all .3s ease-in-out",
                            }}
                            className="flex flex-col justify-center relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
                        >
                            <span className="text-center text-xl font-bold">
                                {t(
                                    "admin.admin_panel.main_page.sections.food_shipping.headline"
                                )}
                            </span>
                            <div className="relative" style={{ flex: "1" }}>
                                <img
                                    style={{
                                        height: "100%",
                                        objectFit: "scale-down",
                                    }}
                                    className="absolute inset-0 m-auto"
                                    src="/static/admin/images/png/food-shipping.png"
                                    alt="food shipping image"
                                />
                            </div>
                        </div>
                    </NavLink>
                    {/* Settings */}
                    <SettingsSection pub={pub} />
                </>
            )}
        </div>
    );
};

const OrdersSection = ({ pubID }) => {
    const { t } = useTranslation();
    const orders = useSelector(selectOrders);
    const orderCounts = useMemo(() => {
        if (!orders) return null;

        const counts = {
            [orderStatuses.notHandled]: 0,
            [orderStatuses.handled]: 0,
            [orderStatuses.preparing]: 0,
            [orderStatuses.completed]: 0,
        };

        orders.forEach((order) => {
            if (order.status === orderStatuses.notHandled)
                counts[orderStatuses.notHandled]++;
            if (order.status === orderStatuses.handled)
                counts[orderStatuses.handled]++;
            if (order.status === orderStatuses.preparing)
                counts[orderStatuses.preparing]++;
            if (order.status === orderStatuses.completed)
                counts[orderStatuses.completed]++;
        });

        return counts;
    }, [orders]);
    return (
        <NavLink
            to={`/admin/pub/${pubID}/orders`}
            style={{ display: "block", width: "250px" }}
        >
            <div
                style={{
                    width: "100%",
                    height: "300px",
                    maxWidth: "250px",
                    transition: "all .3s ease-in-out",
                }}
                className="flex flex-col justify-between relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
            >
                {orderCounts && (
                    <div
                        className="absolute flex flex-col gap-2 rounded-md right-2 top-4 px-3 py-4"
                        style={{ zIndex: 30, background: "#222f4d" }}
                    >
                        <div
                            className="rounded-full  flex items-center justify-center text-white"
                            style={{
                                height: 30,
                                width: 30,
                                background: "#ef4444",
                            }}
                        >
                            {orderCounts[orderStatuses.notHandled]}
                        </div>
                        <div
                            className="rounded-full flex items-center justify-center text-white"
                            style={{
                                height: 30,
                                width: 30,
                                background: "#eab308",
                            }}
                        >
                            {orderCounts[orderStatuses.handled]}
                        </div>
                        <div
                            className="rounded-full flex items-center justify-center text-white"
                            style={{
                                height: 30,
                                width: 30,
                                background: "#fb923c",
                            }}
                        >
                            {orderCounts[orderStatuses.preparing]}
                        </div>
                        <div
                            className="rounded-full flex items-center justify-center text-white"
                            style={{
                                height: 30,
                                width: 30,
                                background: "#059669",
                            }}
                        >
                            {orderCounts[orderStatuses.completed]}
                        </div>
                    </div>
                )}
                <span className="text-center text-xl font-bold">
                    {t("admin.admin_panel.main_page.sections.orders.headline")}
                </span>
                <div className="relative" style={{ flex: "1 1 100%" }}>
                    <img
                        style={{
                            height: "100%",
                            objectFit: "scale-down",
                        }}
                        className="absolute inset-0 m-auto"
                        src="/static/admin/images/png/orders_in_phone.png"
                        alt="food shipping image"
                    />
                </div>
            </div>
        </NavLink>
    );
};

const SettingsSection = ({ pub }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const handleEditClick = () => {
        dispatch(openUpdatePubPopup(pub));
    };

    return (
        <div
            style={{ display: "block", width: "250px" }}
            onClick={handleEditClick}
        >
            <div
                style={{
                    width: "100%",
                    height: "300px",
                    maxWidth: "250px",
                    transition: "all .3s ease-in-out",
                }}
                className="flex flex-col justify-center relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
            >
                <span className="text-center text-xl font-bold">
                    {t(
                        "admin.admin_panel.main_page.sections.settings.headline"
                    )}
                </span>
                <div className="relative" style={{ flex: "1" }}>
                    <img
                        style={{
                            height: "100%",
                            objectFit: "scale-down",
                        }}
                        className="absolute inset-0 m-auto"
                        src="/static/admin/images/svg/settings-colored.svg"
                        alt="food shipping image"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sections;
