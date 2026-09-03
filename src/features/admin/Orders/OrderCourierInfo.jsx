import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";
import { Card, SectionLabel } from "@/components/design/Card";
import CourierCard from "../../courier/CourierCard";
import CourierAvatar from "../../courier/CourierAvatar";
import { useGetCourierByIDQuery } from "../../../api/courier/courier";
import { ClockIcon, PhoneIcon } from "./OrderInfo/icons";

// Sits right above the status/timeline section on the order-detail screen -
// same spot the old design had it - restyled to the Card/SectionLabel
// vocabulary the rest of this page already uses.
const OrderCourierInfo = ({ order }) => {
  const { t } = useTranslation();

  const hasCourier =
    order?.courier_info?.is_reserved && order?.courier_info.reserver_courier_id;

  const { data: courierData } = useGetCourierByIDQuery(
    { courierID: order?.courier_info?.reserver_courier_id },
    { skip: !hasCourier }
  );

  const notYetVisibleToCouriers =
    order?.status === orderStatuses.notHandled || order?.status === orderStatuses.handled;

  return (
    <Card>
      <SectionLabel>{t("admin.admin_panel.order_page.order_courier_info.title")}</SectionLabel>

      {hasCourier ? (
        <div className="flex items-center gap-3">
          <CourierAvatar courier={courierData?.courier} />
          <div className="flex-grow min-w-0">
            <div className="text-[12px] text-muted">
              {t("admin.admin_panel.order_page.order_courier_info.courier_was_found")}
            </div>
            <CourierCard courier={courierData?.courier} />
            {courierData?.courier?.phone_number && (
              <a
                href={`tel:${courierData.courier.phone_number}`}
                className="flex items-center gap-1.5 text-[12.5px] text-muted mt-0.5 hover:text-ink"
              >
                <PhoneIcon width={13} height={13} className="flex-shrink-0" />
                {courierData.courier.phone_number}
              </a>
            )}
          </div>
        </div>
      ) : notYetVisibleToCouriers ? (
        <div className="flex items-center gap-2.5 text-[13.5px] text-muted">
          <ClockIcon width={16} height={16} className="flex-shrink-0 text-muted-2" />
          {t("admin.admin_panel.order_page.order_courier_info.set_status_to_preparing_for_couriers")}
        </div>
      ) : order?.status === orderStatuses.preparing ? (
        <div className="flex items-center gap-2.5 text-[13.5px] text-muted">
          <ClockIcon width={16} height={16} className="flex-shrink-0 text-muted-2 animate-pulse" />
          {t("admin.admin_panel.order_page.order_courier_info.searching_for_couriers")}...
        </div>
      ) : (
        <div className="text-[13.5px] text-muted-2">
          {t("admin.admin_panel.order_page.order_courier_info.no_courier")}
        </div>
      )}
    </Card>
  );
};

export default OrderCourierInfo;
