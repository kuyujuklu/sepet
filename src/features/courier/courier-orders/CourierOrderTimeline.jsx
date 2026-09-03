import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetCourierOrderStatusEventsQuery } from "@/api/courier/courier";
import { Card, SectionLabel } from "@/components/design/Card";
import { orderStatuses } from "@/static-data/data";
import { getOrderColor } from "@/utils/order-utils";
import { GetUtcDateFromApiTime } from "@/utils/time";
import { CheckIcon } from "../icons";

// Courier-scoped twin of admin/Orders/OrderInfo/OrderTimeline.jsx - same
// four stages and visual language, but backed by the courier's own
// status-events endpoint (the admin one is company/pub-scoped and a
// courier's token can never satisfy that check).
const STAGES = [
  { key: orderStatuses.notHandled, labelKey: "not_handled" },
  { key: orderStatuses.preparing, labelKey: "preparing" },
  { key: orderStatuses.atCourier, labelKey: "at_courier" },
  { key: orderStatuses.completed, labelKey: "completed" },
];

const TICK_MS = 30000;

const formatClock = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const CourierOrderTimeline = ({ courierID, orderID, status }) => {
  const { t } = useTranslation();

  const { data } = useGetCourierOrderStatusEventsQuery(
    { courierID, orderID },
    { skip: !courierID || !orderID }
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const eventTimeByStatus = (data?.events ?? []).reduce((acc, event) => {
    acc[event.status] = GetUtcDateFromApiTime(event.created_at_utc);
    return acc;
  }, {});

  const stageIndex = STAGES.findIndex((stage) => stage.key === status);
  const isCanceled = status === orderStatuses.canceled;
  const activeColor = isCanceled ? "#d1d5db" : getOrderColor(status);

  let previousEventTime = null;

  return (
    <Card>
      <SectionLabel>{t("admin.admin_panel.order_page.timeline_label")}</SectionLabel>
      <div className="flex items-start">
        {STAGES.map((stage, i) => {
          const isDone = !isCanceled && i < stageIndex;
          const isCurrent = !isCanceled && i === stageIndex;
          const eventTime = isDone || isCurrent ? eventTimeByStatus[stage.key] : null;

          const deltaMinutes = isCurrent
            ? eventTime
              ? Math.max(0, Math.round((now - eventTime.getTime()) / 60000))
              : null
            : eventTime && previousEventTime
              ? Math.max(0, Math.round((eventTime - previousEventTime) / 60000))
              : null;
          if (eventTime) previousEventTime = eventTime;

          return (
            <Fragment key={stage.key}>
              {i > 0 && (
                <div
                  className="flex-1"
                  style={{
                    height: 1.5,
                    marginTop: 7,
                    background: i <= stageIndex && !isCanceled ? activeColor : "#e4e9ee",
                  }}
                />
              )}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 px-0.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={
                    isDone
                      ? { background: activeColor }
                      : isCurrent
                        ? { background: "#fff", border: `2px solid ${activeColor}`, boxShadow: `0 0 0 3px ${activeColor}22` }
                        : { background: "#e4e9ee" }
                  }
                >
                  {isDone && <CheckIcon width={10} height={10} strokeWidth={3} />}
                </div>
                <div className="text-[10.5px] font-semibold num" style={{ color: eventTime ? "#1c2733" : "#94a3b0" }}>
                  {eventTime ? formatClock(eventTime) : "—:—"}
                </div>
                <div
                  className="text-[9.5px] text-center"
                  style={{ color: isCurrent ? activeColor : "#94a3b0", fontWeight: isCurrent ? 600 : 400 }}
                >
                  {t(`admin.admin_panel.order_page.order_statuses.${stage.labelKey}`)}
                </div>
                {deltaMinutes !== null && (
                  <div className="text-[9px]" style={{ color: "#94a3b0" }}>
                    +{deltaMinutes} {t("admin.admin_panel.order_page.minutes_shortcut")}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </Card>
  );
};

export default CourierOrderTimeline;
