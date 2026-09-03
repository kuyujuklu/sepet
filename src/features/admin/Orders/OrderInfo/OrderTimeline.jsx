import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetOrderStatusEventsQuery } from "@/api/orders/orders";
import { Card, SectionLabel } from "@/components/design/Card";
import { orderStatuses } from "@/static-data/data";
import { getOrderColor } from "@/utils/order-utils";
import { GetUtcDateFromApiTime } from "@/utils/time";
import { CheckIcon } from "./icons";

const STAGES = [
  { key: orderStatuses.notHandled, labelKey: "not_handled" },
  { key: orderStatuses.preparing, labelKey: "preparing" },
  { key: orderStatuses.atCourier, labelKey: "at_courier" },
  { key: orderStatuses.completed, labelKey: "completed" },
];

const TICK_MS = 30000;

const formatClock = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

// Real per-order status history - each dot's timestamp comes from the
// OrderStatusEvent audit log (backend), not a guess. Mirrors the color
// convention OrderStatuses.jsx already uses for its own progress bar: every
// reached stage/segment shares the ONE color derived from the order's
// current status, rather than each stage having its own fixed color.
const OrderTimeline = ({ companyID, pubID, orderID, status }) => {
  const { t } = useTranslation();

  const { data } = useGetOrderStatusEventsQuery(
    { companyID, pubID, orderID },
    { skip: !companyID || !pubID || !orderID }
  );

  // The current stage hasn't ended yet, so its "time in this stage" keeps
  // growing - tick a re-render every so often so that number stays live
  // instead of freezing at whatever it was on the last data fetch.
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
          // Only pull a real timestamp for a stage that's part of the
          // CURRENT forward path (i <= stageIndex) - a stage further along
          // than the order's current status can still have a stale event
          // from an earlier pass (statuses are directly clickable, so a pub
          // can jump forward then back for corrections/testing), and that
          // must not render as if already reached.
          const eventTime = isDone || isCurrent ? eventTimeByStatus[stage.key] : null;

          // Done stages get a fixed, historical duration (time spent in
          // that stage, from the previous stage's timestamp to this one's).
          // The current stage isn't done yet - there's no "next" timestamp
          // to measure against, so it gets a live elapsed count against
          // `now` instead, which keeps growing every tick.
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
                        ? {
                          background: "#fff",
                          border: `2px solid ${activeColor}`,
                          boxShadow: `0 0 0 3px ${activeColor}22`,
                        }
                        : { background: "#e4e9ee" }
                  }
                >
                  {isDone && <CheckIcon width={10} height={10} strokeWidth={3} />}
                </div>
                <div
                  className="text-[10.5px] font-semibold num"
                  style={{ color: eventTime ? "#1c2733" : "#94a3b0" }}
                >
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

export default OrderTimeline;
