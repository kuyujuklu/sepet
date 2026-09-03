import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetEstimatedPreparingMinutesQuery,
  useGetOrderStatusEventsQuery,
} from "@/api/orders/orders";
import { Card, SectionLabel } from "@/components/design/Card";
import { orderStatuses } from "@/static-data/data";
import { GetUtcDateFromApiTime } from "@/utils/time";

const TICK_MS = 30000;

// Replaces the old "pick minutes from a dropdown" popup: the countdown is
// computed from how long recent orders in this delivery zone actually took
// between "preparing" and "at_courier" (falling back to the pub-wide average
// when the zone doesn't have enough history yet - see backend
// GetEstimatedPreparingMinutes). Nothing to type in, nothing to keep in sync
// by hand.
const EstimatedReadyCard = ({ companyID, pubID, orderID, status, shapeID, zoneLabel }) => {
  const { t } = useTranslation();

  const { data: eventsData } = useGetOrderStatusEventsQuery(
    { companyID, pubID, orderID },
    { skip: !companyID || !pubID || !orderID || status !== orderStatuses.preparing }
  );
  const { data: estimateData } = useGetEstimatedPreparingMinutesQuery(
    { companyID, pubID, shapeID },
    { skip: !companyID || !pubID || status !== orderStatuses.preparing }
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (status !== orderStatuses.preparing) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [status]);

  if (status !== orderStatuses.preparing) return null;

  const preparingEvent = eventsData?.events?.find((e) => e.status === orderStatuses.preparing);
  if (!preparingEvent || !estimateData || estimateData.sample_count === 0) return null;

  const preparingStartedAt = GetUtcDateFromApiTime(preparingEvent.created_at_utc);
  const estimatedMinutes = Math.round(estimateData.minutes);
  const elapsedMinutes = Math.max(0, (now - preparingStartedAt.getTime()) / 60000);
  const remainingMinutes = Math.ceil(estimatedMinutes - elapsedMinutes);
  const isOverdue = remainingMinutes <= 0;
  const progressPercent = Math.min(100, estimatedMinutes > 0 ? (elapsedMinutes / estimatedMinutes) * 100 : 100);
  const color = isOverdue ? "#f2994a" : "#2D7DD2";

  const basisText =
    estimateData.based_on === "zone" && zoneLabel
      ? t("admin.admin_panel.order_page.ready_estimate.based_on_zone", {
        zone: zoneLabel,
        count: estimateData.sample_count,
      })
      : t("admin.admin_panel.order_page.ready_estimate.based_on_pub", {
        count: estimateData.sample_count,
      });

  return (
    <Card>
      <div>
        <SectionLabel>{t("admin.admin_panel.order_page.ready_estimate.title")}</SectionLabel>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-[28px] font-bold num" style={{ color }}>
            {isOverdue ? 0 : remainingMinutes}
          </span>
          <span className="text-[14px] text-muted">
            {t("admin.admin_panel.order_page.minutes_shortcut")}
          </span>
        </div>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#e4e9ee" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${progressPercent}%`, background: color }}
        />
      </div>
      <div className="text-[12px] text-muted">
        {isOverdue
          ? t("admin.admin_panel.order_page.ready_estimate.overdue", { minutes: estimatedMinutes })
          : basisText}
      </div>
    </Card>
  );
};

export default EstimatedReadyCard;
