import { useMemo } from "react";
import { useGetAllPushCampaignsQuery } from "@/api/admin/admin";
import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { RepeatIcon } from "./icons";

const STATUS_STYLE = {
  scheduled: { bg: "#f2f4f6", color: "#526070", dot: "#94a3b0", label: "Запланировано" },
  sending: { bg: "#e8f1fb", color: "#1f63ab", dot: "#2D7DD2", label: "Отправляется" },
  sent: { bg: "rgba(26,158,107,.1)", color: "#1a9e6b", dot: "#1a9e6b", label: "Отправлено" },
  failed: { bg: "rgba(224,72,58,.1)", color: "#e0483a", dot: "#e0483a", label: "Ошибка" },
  canceled: { bg: "rgba(138,148,160,.12)", color: "#8a94a0", dot: "#8a94a0", label: "Отменено" },
};

const DEEP_LINK_LABELS = {
  pub: "заведение",
  order: "заказ",
  dish: "блюдо",
  screen: "экран",
  url: "ссылка",
};

const AUDIENCE_LABELS = {
  pub_customers: "клиенты заведения",
  inactive: "неактивные",
  first_time: "новые клиенты",
  frequent: "постоянные клиенты",
};

const openRate = (c) => (c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0);
const deliveredRate = (c) => (c.sent_count > 0 ? Math.round((c.delivered_count / c.sent_count) * 100) : 0);

const shortTitle = (title) => (title?.length > 14 ? title.slice(0, 13) + "…" : title);

const FunnelStep = ({ num, label, percent, color }) => (
  <div className="flex-grow flex flex-col" style={{ gap: 4 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#1c2733" }}>{num.toLocaleString("ru-RU")}</div>
    <div style={{ fontSize: 10.5, color: "#94a3b0" }}>{label}</div>
    <div style={{ height: 5, borderRadius: 3, background: "#f0f2f5", overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 3, width: `${percent}%`, background: color }} />
    </div>
  </div>
);

const CampaignRow = ({ campaign, onRepeat }) => {
  const status = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.scheduled;
  const metaParts = [];

  if (campaign.status === "scheduled") {
    metaParts.push(`Запланировано на ${ConvertQrMenuApiTimeToLocal(campaign.scheduled_at_utc, "ru")}`);
  } else if (campaign.sent_at_utc) {
    metaParts.push(`Отправлено ${ConvertQrMenuApiTimeToLocal(campaign.sent_at_utc, "ru")}`);
  } else {
    metaParts.push(`Создано ${ConvertQrMenuApiTimeToLocal(campaign.created_at_utc, "ru")}`);
  }
  if (DEEP_LINK_LABELS[campaign.deep_link_type]) metaParts.push(`ссылка: ${DEEP_LINK_LABELS[campaign.deep_link_type]}`);
  if (AUDIENCE_LABELS[campaign.audience_type]) metaParts.push(`аудитория: ${AUDIENCE_LABELS[campaign.audience_type]}`);

  const showFunnel = campaign.sent_count > 0 || campaign.failed_count > 0;

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div className="flex items-start justify-between" style={{ gap: 10 }}>
        <div className="min-w-0">
          <div className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "#1c2733" }}>
            {campaign.title_ru}
          </div>
          <div className="truncate" style={{ fontSize: 11.5, color: "#526070", marginTop: 2 }}>
            {metaParts.join(" · ")}
          </div>
        </div>
        <div
          className="inline-flex items-center flex-shrink-0"
          style={{ gap: 5, height: 22, padding: "0 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", background: status.bg, color: status.color }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot }} />
          {status.label}
        </div>
      </div>

      {showFunnel ? (
        <div className="flex items-center">
          <FunnelStep num={campaign.recipient_count} label="Отправлено" percent={100} color="#94a3b0" />
          <FunnelStep num={campaign.delivered_count} label={`Доставлено · ${deliveredRate(campaign)}%`} percent={deliveredRate(campaign)} color="#2D7DD2" />
          <FunnelStep num={campaign.opened_count} label={`Открыто · ${openRate(campaign)}%`} percent={openRate(campaign)} color="#1a9e6b" />
          <button
            type="button"
            onClick={() => onRepeat(campaign)}
            title="Повторить"
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: 9, background: "#f2f4f6", color: "#526070", border: "none", cursor: "pointer", marginLeft: 8 }}
          >
            <RepeatIcon />
          </button>
        </div>
      ) : campaign.status === "failed" ? (
        <div style={{ fontSize: 12.5, color: "#e0483a" }}>Не удалось отправить — ни один клиент не подошёл под аудиторию.</div>
      ) : null}
    </div>
  );
};

// onRepeat is a no-op placeholder for now (the compose form above doesn't
// yet accept prefill input) - the button's there because the design calls
// for it, but wiring it to actually refill the form is follow-up work.
const noopRepeat = () => {};

const PushCampaignHistory = () => {
  const { data, isLoading } = useGetAllPushCampaignsQuery(undefined, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });
  const campaigns = useMemo(() => data?.campaigns ?? [], [data]);

  const chartCampaigns = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === "sent" && c.sent_count > 0)
        .slice(0, 6)
        .reverse(),
    [campaigns]
  );
  const maxOpenRate = Math.max(1, ...chartCampaigns.map(openRate));

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: "#94a3b0", padding: "0 4px" }}>
        История рассылок
      </div>

      {chartCampaigns.length > 0 && (
        <div className="bg-white rounded-2xl" style={{ border: "1px solid #e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: "#94a3b0", marginBottom: 6 }}>
            Открываемость — последние рассылки
          </div>
          <div className="flex items-end" style={{ gap: 10, height: 100, paddingTop: 6 }}>
            {chartCampaigns.map((c, i) => {
              const rate = openRate(c);
              const isLast = i === chartCampaigns.length - 1;
              return (
                <div key={c.id} className="flex flex-col items-center" style={{ flex: 1, gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1c2733" }}>{rate}%</div>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(4, (rate / maxOpenRate) * 100)}%`,
                      borderRadius: "6px 6px 0 0",
                      background: isLast ? "#2D7DD2" : "#e8f1fb",
                    }}
                  />
                  <div className="truncate" style={{ fontSize: 9.5, color: "#94a3b0", maxWidth: "100%" }}>
                    {shortTitle(c.title_ru)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl flex flex-col" style={{ border: "1px solid #e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: 18, gap: 10 }}>
        {isLoading && <div style={{ fontSize: 13.5, color: "#94a3b0" }}>Загрузка...</div>}
        {!isLoading && campaigns.length === 0 && <div style={{ fontSize: 13.5, color: "#94a3b0" }}>Рассылок пока не было.</div>}
        {campaigns.map((c, i) => (
          <div key={c.id}>
            <CampaignRow campaign={c} onRepeat={noopRepeat} />
            {i < campaigns.length - 1 && <div style={{ height: 1, background: "#f0f2f5", marginTop: 10 }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PushCampaignHistory;
