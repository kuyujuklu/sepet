import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  useCreatePushCampaignMutation,
  useLazyGetPushCampaignAudiencePreviewQuery,
  useTestSendPushCampaignMutation,
} from "@/api/admin/admin";
import { pushAlert, alertTypes } from "../../alerts/alertSlice";
import PubPicker from "./PubPicker";
import { BellIcon, PinIcon, OrderIcon, DishIcon, ScreenIcon, LinkIcon, SendIcon, PeopleIcon, PersonCheckIcon, ChevronDownIcon } from "./icons";

const DEEP_LINK_TARGETS = [
  { value: "none", label: "Просто открыть приложение", icon: BellIcon },
  { value: "pub", label: "Заведение", icon: PinIcon },
  { value: "order", label: "Заказ", icon: OrderIcon },
  { value: "dish", label: "Блюдо", icon: DishIcon },
  { value: "screen", label: "Экран приложения", icon: ScreenIcon },
  { value: "url", label: "Внешняя ссылка", icon: LinkIcon },
];

// Matches app/src/app/navigation/screens.js's Screens enum, trimmed to the
// ones that make sense as a push destination (not auth/error/onboarding
// screens a signed-in, up-to-date user would never need linked to).
const APP_SCREENS = [
  { value: "Home", label: "Главная" },
  { value: "Orders", label: "Заказы" },
  { value: "Basket", label: "Корзина" },
  { value: "Profile", label: "Профиль" },
  { value: "Notifications", label: "Уведомления" },
  { value: "SectionPicker", label: "Выбор раздела" },
];

const AUDIENCE_TARGETS = [
  { value: "all", label: "Все клиенты" },
  { value: "pub_customers", label: "Клиенты заведения" },
  { value: "inactive", label: "Не заказывали N+ дней" },
  { value: "first_time", label: "Новые клиенты (1 заказ)" },
  { value: "frequent", label: "Постоянные (5+ заказов)" },
];

const fieldStyle = {
  width: "100%",
  border: "1.5px solid #e4e9ee",
  borderRadius: 12,
  background: "#fff",
  color: "#1c2733",
  fontFamily: "inherit",
  fontSize: 14,
  padding: "11px 13px",
  outline: "none",
};

const PushCampaignCompose = () => {
  const dispatch = useDispatch();

  const [lang, setLang] = useState("ru");
  const [titleRu, setTitleRu] = useState("");
  const [titleRo, setTitleRo] = useState("");
  const [bodyRu, setBodyRu] = useState("");
  const [bodyRo, setBodyRo] = useState("");

  const [deepLinkType, setDeepLinkType] = useState("none");
  const [deepLinkPubID, setDeepLinkPubID] = useState(null);
  const [deepLinkOrderID, setDeepLinkOrderID] = useState("");
  const [deepLinkDishID, setDeepLinkDishID] = useState("");
  const [deepLinkScreen, setDeepLinkScreen] = useState("Home");
  const [deepLinkURL, setDeepLinkURL] = useState("");

  const [audienceType, setAudienceType] = useState("all");
  const [audiencePubID, setAudiencePubID] = useState(null);
  const [audienceInactiveDays, setAudienceInactiveDays] = useState(30);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ttlHours, setTtlHours] = useState("");
  const [priority, setPriority] = useState("default");

  const [sendMode, setSendMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");

  const [testPhone, setTestPhone] = useState("");

  const [fetchAudiencePreview, { data: audiencePreviewData, isFetching: isAudienceFetching }] =
    useLazyGetPushCampaignAudiencePreviewQuery();

  // Debounced: audienceInactiveDays changes on every keystroke while typing
  // a day count, and without this each one fired its own request.
  useEffect(() => {
    if (audienceType === "pub_customers" && !audiencePubID) return;

    const timeoutId = setTimeout(() => {
      fetchAudiencePreview({ audienceType, pubID: audiencePubID, inactiveDays: audienceInactiveDays });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [audienceType, audiencePubID, audienceInactiveDays, fetchAudiencePreview]);

  const recipientCount = audiencePreviewData?.count ?? 0;

  const buildDeepLinkFields = () => ({
    deep_link_type: deepLinkType,
    deep_link_pub_id: deepLinkType === "pub" || deepLinkType === "dish" ? Number(deepLinkPubID) || 0 : 0,
    deep_link_order_id: deepLinkType === "order" ? Number(deepLinkOrderID) || 0 : 0,
    deep_link_dish_id: deepLinkType === "dish" ? Number(deepLinkDishID) || 0 : 0,
    deep_link_screen: deepLinkType === "screen" ? deepLinkScreen : "",
    deep_link_url: deepLinkType === "url" ? deepLinkURL.trim() : "",
  });

  const bothLanguagesFilled = titleRu.trim() && titleRo.trim() && bodyRu.trim() && bodyRo.trim();

  const deepLinkValid = useMemo(() => {
    switch (deepLinkType) {
      case "pub":
        return !!deepLinkPubID;
      case "order":
        return !!deepLinkOrderID;
      case "dish":
        return !!deepLinkPubID && !!deepLinkDishID;
      case "screen":
        return !!deepLinkScreen;
      case "url":
        return !!deepLinkURL.trim();
      default:
        return true;
    }
  }, [deepLinkType, deepLinkPubID, deepLinkOrderID, deepLinkDishID, deepLinkScreen, deepLinkURL]);

  const audienceValid = audienceType !== "pub_customers" || !!audiencePubID;
  const scheduleValid = sendMode !== "schedule" || !!scheduledAt;

  const canSubmit = bothLanguagesFilled && deepLinkValid && audienceValid && scheduleValid && recipientCount > 0;

  const [createCampaign, { isLoading: isSending }] = useCreatePushCampaignMutation();
  const [testSend, { isLoading: isTestSending }] = useTestSendPushCampaignMutation();

  const resetForm = () => {
    setTitleRu("");
    setTitleRo("");
    setBodyRu("");
    setBodyRo("");
    setDeepLinkType("none");
    setDeepLinkPubID(null);
    setDeepLinkOrderID("");
    setDeepLinkDishID("");
    setDeepLinkURL("");
    setAudienceType("all");
    setAudiencePubID(null);
    setTtlHours("");
    setPriority("default");
    setSendMode("now");
    setScheduledAt("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSending) return;
    try {
      await createCampaign({
        title_ru: titleRu,
        title_ro: titleRo,
        body_ru: bodyRu,
        body_ro: bodyRo,
        ...buildDeepLinkFields(),
        audience_type: audienceType,
        audience_pub_id: audienceType === "pub_customers" ? Number(audiencePubID) || 0 : 0,
        audience_inactive_days: audienceType === "inactive" ? Number(audienceInactiveDays) || 0 : 0,
        ttl_hours: Number(ttlHours) || 0,
        priority,
        scheduled_at: sendMode === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : "",
      }).unwrap();

      dispatch(
        pushAlert({
          type: alertTypes.success,
          header: "Готово",
          message: sendMode === "now" ? "Рассылка запущена — статусы появятся в истории ниже" : "Рассылка запланирована",
          delay: 5000,
        })
      );
      resetForm();
    } catch (e) {
      dispatch(
        pushAlert({
          type: alertTypes.danger,
          header: "Ошибка",
          message: e?.data?.err || "Не удалось создать рассылку",
          delay: 5000,
        })
      );
    }
  };

  const handleTestSend = async () => {
    if (!testPhone.trim() || isTestSending) return;
    try {
      await testSend({
        phone: testPhone.trim(),
        title_ru: titleRu || "Тест",
        title_ro: titleRo || "Test",
        body_ru: bodyRu || "Тестовое уведомление",
        body_ro: bodyRo || "Notificare de test",
        ...buildDeepLinkFields(),
      }).unwrap();
      dispatch(pushAlert({ type: alertTypes.success, header: "Отправлено", message: "Тестовый пуш отправлен", delay: 4000 }));
    } catch (e) {
      dispatch(
        pushAlert({
          type: alertTypes.danger,
          header: "Ошибка",
          message: e?.data?.err || "Не удалось отправить тест — проверьте номер и подписку",
          delay: 5000,
        })
      );
    }
  };

  return (
    <div
      className="bg-white rounded-2xl flex flex-col"
      style={{ border: "1px solid #e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: 18, gap: 14 }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: "#1c2733" }}>Новая рассылка</div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Язык текста</div>
        <div className="flex" style={{ padding: 3, borderRadius: 12, background: "#f2f4f6", gap: 2, maxWidth: 160 }}>
          {["ru", "ro"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 9,
                border: "none",
                background: lang === l ? "#1c2733" : "transparent",
                color: lang === l ? "#fff" : "#526070",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Заголовок</div>
        <input
          type="text"
          style={fieldStyle}
          value={lang === "ru" ? titleRu : titleRo}
          onChange={(e) => (lang === "ru" ? setTitleRu(e.target.value) : setTitleRo(e.target.value))}
          placeholder={lang === "ru" ? "Скидка 20% сегодня" : "Reducere 20% astăzi"}
        />
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Текст уведомления</div>
        <textarea
          style={{ ...fieldStyle, resize: "vertical", minHeight: 64, lineHeight: 1.4 }}
          value={lang === "ru" ? bodyRu : bodyRo}
          onChange={(e) => (lang === "ru" ? setBodyRu(e.target.value) : setBodyRo(e.target.value))}
        />
        {!bothLanguagesFilled && (
          <div style={{ fontSize: 12, color: "#94a3b0", marginTop: 5 }}>
            {lang === "ru" ? "RO" : "RU"} ещё не заполнен — отправка заблокирована, пока не заполнены оба языка.
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "#f0f2f5" }} />

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: "#94a3b0", marginBottom: 8 }}>
          Куда ведёт пуш
        </div>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {DEEP_LINK_TARGETS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeepLinkType(value)}
              className="inline-flex items-center"
              style={{
                gap: 6,
                height: 34,
                padding: "0 13px",
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                background: deepLinkType === value ? "#e8f1fb" : "transparent",
                color: deepLinkType === value ? "#1f63ab" : "#526070",
                border: deepLinkType === value ? "1.5px solid #cfe0f5" : "1.5px solid #e4e9ee",
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {deepLinkType === "pub" && (
          <div style={{ marginTop: 10 }}>
            <PubPicker selectedPubID={deepLinkPubID} onSelect={setDeepLinkPubID} subtitle="Тапнув пуш, клиент попадёт на страницу этого заведения" />
          </div>
        )}

        {deepLinkType === "order" && (
          <input
            type="number"
            style={{ ...fieldStyle, marginTop: 10 }}
            placeholder="ID заказа"
            value={deepLinkOrderID}
            onChange={(e) => setDeepLinkOrderID(e.target.value)}
          />
        )}

        {deepLinkType === "dish" && (
          <div className="flex flex-col" style={{ gap: 8, marginTop: 10 }}>
            <PubPicker selectedPubID={deepLinkPubID} onSelect={setDeepLinkPubID} subtitle="Заведение, которому принадлежит блюдо" />
            <input
              type="number"
              style={fieldStyle}
              placeholder="ID блюда"
              value={deepLinkDishID}
              onChange={(e) => setDeepLinkDishID(e.target.value)}
            />
            <div style={{ fontSize: 11.5, color: "#94a3b0" }}>
              Пока не открывается в приложении по ссылке — там блюда открываются только из уже загруженного списка. Сама рассылка при этом работает; переход доработаем отдельно.
            </div>
          </div>
        )}

        {deepLinkType === "screen" && (
          <select
            style={{ ...fieldStyle, marginTop: 10 }}
            value={deepLinkScreen}
            onChange={(e) => setDeepLinkScreen(e.target.value)}
          >
            {APP_SCREENS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        {deepLinkType === "url" && (
          <input
            type="text"
            style={{ ...fieldStyle, marginTop: 10 }}
            placeholder="https://..."
            value={deepLinkURL}
            onChange={(e) => setDeepLinkURL(e.target.value)}
          />
        )}
      </div>

      <div style={{ height: 1, background: "#f0f2f5" }} />

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: "#94a3b0", marginBottom: 8 }}>
          Аудитория
        </div>
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
          {AUDIENCE_TARGETS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudienceType(value)}
              style={{
                height: 34,
                padding: "0 13px",
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                background: audienceType === value ? "#e8f1fb" : "transparent",
                color: audienceType === value ? "#1f63ab" : "#526070",
                border: audienceType === value ? "1.5px solid #cfe0f5" : "1.5px solid #e4e9ee",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {audienceType === "pub_customers" && (
          <div style={{ marginBottom: 10 }}>
            <PubPicker selectedPubID={audiencePubID} onSelect={setAudiencePubID} subtitle="Только те, кто хоть раз тут заказывал" />
          </div>
        )}

        {audienceType === "inactive" && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Не заказывали, дней</div>
            <input
              type="number"
              style={fieldStyle}
              value={audienceInactiveDays}
              onChange={(e) => setAudienceInactiveDays(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center" style={{ gap: 10, background: "#f2f4f6", borderRadius: 12, padding: "11px 13px" }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: "#fff", color: "#526070" }}>
            <PeopleIcon />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2733" }}>
              {isAudienceFetching ? "Считаем..." : `≈ ${recipientCount.toLocaleString("ru-RU")} клиент${pluralSuffix(recipientCount)}`}
            </div>
            <div style={{ fontSize: 11.5, color: "#526070" }}>с включёнными пушами · язык каждого учитывается автоматически</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#f0f2f5" }} />

      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex items-center"
          style={{ gap: 6, fontSize: 12.5, fontWeight: 600, color: "#526070", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          <ChevronDownIcon style={{ transform: advancedOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
          Дополнительно
        </button>
        {advancedOpen && (
          <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Актуально (часов)</div>
              <input type="number" style={fieldStyle} placeholder="без ограничения" value={ttlHours} onChange={(e) => setTtlHours(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733", marginBottom: 6 }}>Приоритет</div>
              <div className="flex" style={{ padding: 3, borderRadius: 12, background: "#f2f4f6", gap: 2 }}>
                {[
                  ["default", "Обычный"],
                  ["high", "Высокий"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPriority(v)}
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: 9,
                      border: "none",
                      background: priority === v ? "#1c2733" : "transparent",
                      color: priority === v ? "#fff" : "#526070",
                      fontSize: 12.5,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "#f0f2f5" }} />

      <div>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: "#f2f4f6", color: "#526070" }}>
            <PersonCheckIcon />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1c2733" }}>Тестовая отправка</div>
            <div style={{ fontSize: 12, color: "#94a3b0" }}>Проверьте, как пуш выглядит на телефоне, прежде чем отправлять всем</div>
          </div>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <input
            type="text"
            style={{ ...fieldStyle, flex: 1 }}
            placeholder="Номер телефона тестового получателя"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
          <button
            type="button"
            onClick={handleTestSend}
            disabled={!testPhone.trim() || isTestSending}
            style={{
              flexShrink: 0,
              height: 40,
              padding: "0 16px",
              borderRadius: 11,
              background: "#fff",
              color: "#1f63ab",
              border: "1.5px solid #cfe0f5",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              opacity: !testPhone.trim() || isTestSending ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isTestSending ? "..." : "Отправить тест"}
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: "#f0f2f5" }} />

      <div className="flex" style={{ padding: 3, borderRadius: 12, background: "#f2f4f6", gap: 2 }}>
        {[
          ["now", "Отправить сейчас"],
          ["schedule", "Запланировать"],
        ].map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setSendMode(v)}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 9,
              border: "none",
              background: sendMode === v ? "#1c2733" : "transparent",
              color: sendMode === v ? "#fff" : "#526070",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {sendMode === "schedule" && (
        <input
          type="datetime-local"
          style={fieldStyle}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSending}
        className="flex items-center justify-center"
        style={{
          width: "100%",
          height: 48,
          borderRadius: 14,
          background: "#2D7DD2",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          gap: 8,
          opacity: !canSubmit || isSending ? 0.6 : 1,
        }}
      >
        <SendIcon stroke="#fff" />
        {isSending
          ? "Отправляем..."
          : sendMode === "now"
          ? `Отправить ${recipientCount.toLocaleString("ru-RU")} клиент${pluralSuffix(recipientCount)}`
          : "Запланировать рассылку"}
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b0" }}>
        Отправка займёт до пары минут — статусы обновятся в истории ниже
      </div>
    </div>
  );
};

// Dative case ("отправить N клиентам") collapses Russian's usual 1/2-4/5+
// plural split into just two forms - singular "клиенту" and every other
// count "клиентам" - unlike nominative counting, which would need all three.
function pluralSuffix(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  return mod10 === 1 && mod100 !== 11 ? "у" : "ам";
}

export default PushCampaignCompose;
