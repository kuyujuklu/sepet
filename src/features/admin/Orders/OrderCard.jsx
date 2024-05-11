import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { orderStatuses } from "@/static-data/data";
import { useTranslation } from "react-i18next";

const OrderCard = ({ order, hasArrow = true }) => {
    const { t, i18n } = useTranslation();

    return (
        <div
            className="flex flex-wrap justify-between gap-x-10 rounded-2xl shadow-xl border-gray-300 border px-10 py-5"
            style={{
                maxWidth: "900px",
                borderColor:
                    order.status === orderStatuses.completed
                        ? "#d1d5dB"
                        : "#059669",
            }}
        >
            <div className="font-bold">
                {t("admin.admin_panel.order_page.order")} №
                {order?.id}
            </div>
            <div className="">{order?.client_name}</div>
            <div className="flex gap-x-10">
                {ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
                {hasArrow && (
                    <img
                        src={"/static/admin/images/svg/arrow-right-black.svg"}
                        width={23}
                        height={23}
                        alt="right arrow"
                    />
                )}
            </div>
        </div>
    );
};

export default OrderCard;
