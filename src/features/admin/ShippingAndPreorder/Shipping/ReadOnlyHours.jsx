import { useTranslation } from "react-i18next";

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const formatMinutes = (minutes) => {
  const m = +minutes || 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h < 10 ? "0" + h : h}:${mm < 10 ? "0" + mm : mm}`;
};

// Plain display version of TimeInput + WorkHoursInput for a pub whose
// delivery hours are network-managed (see Inputs.jsx) - the pub can still
// see its own schedule, just can't change it here.
const ReadOnlyHours = ({ shipping_time_from, shipping_time_to, workHours }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] text-muted">
          {t("admin.admin_panel.shipping.shipping_time.label")}
        </span>
        <span className="text-[14px] font-semibold text-ink">
          {shipping_time_from}–{shipping_time_to} мин
        </span>
      </div>
      {workHours?.length === 7 && (
        <>
          <hr style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />
          <div className="flex flex-col gap-1.5">
            {workHours.map((day, index) => (
              <div key={index} className="flex items-center justify-between text-[13px]">
                <span className="text-muted">{DAY_LABELS[index]}</span>
                <span className="font-semibold text-ink tabular-nums">
                  {day.start === day.end
                    ? "закрыто"
                    : `${formatMinutes(day.start)}–${formatMinutes(day.end)}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReadOnlyHours;
