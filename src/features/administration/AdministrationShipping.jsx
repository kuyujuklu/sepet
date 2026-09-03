import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetAllPubsQuery, useLazyGetPubRefreshTokenQuery } from "../../api/admin/admin";
import {
  useGetShippingCopyPresetsQuery,
  useCreateShippingCopyPresetMutation,
  useUpdateShippingCopyPresetMutation,
  useMarkShippingCopyPresetAppliedMutation,
  useDeleteShippingCopyPresetMutation,
} from "../../api/admin/admin";
import {
  useSetShippingMutation,
  useSetShippingPricesMutation,
  useSetShippingFreeDeliveryPricesMutation,
  useSetShippingAvailabilityMutation,
  useSetShippingTimeMutation,
  useSetShippingWorkHoursMutation,
  useSetAddCommissionToDishPricesMutation,
} from "../../api/pub/pub";
import { setaccesstoken } from "../../api/auth/authBasedQuery";
import { markSuperAdminImpersonation } from "@/utils/superAdminImpersonation";
import { pushAlert, alertTypes } from "../alerts/alertSlice";
import AdministrationNav from "./AdministrationNav";
import usePageTitle from "@/hooks/usePageTitle";

const FLAG_LABELS = [
  ["copy_zones_and_prices", "Зоны и цены"],
  ["copy_availability", "Доступность"],
  ["copy_delivery_time", "Время доставки"],
  ["copy_work_hours", "Часы работы"],
  ["copy_commission", "Комиссия"],
];

// Copies one pub's delivery zones/prices onto a list of other pubs, which
// can belong to different companies - the superadmin's own token already
// has cross-company write access (ADMIN_SIGNIFICANCE < COMPANY_SIGNIFICANCE
// on the backend, see check-access.go), so this is plain reuse of the same
// endpoints the per-pub Shipping screen already calls, just looped over a
// selection instead of one pub at a time. No new backend route needed.
//
// Zones and their prices are copied together and only together - shipping
// zone map[shape_id]price entries are meaningless without matching shapes,
// so "zones and prices" isn't split into separate checkboxes.
//
// Presets (the "history" panel) only remember donor id + target ids + which
// fields to copy, never a snapshot of the donor's actual zones - applying a
// preset always reads the donor's CURRENT shipping data, same as a one-off
// copy. That's deliberate: the motivating use case is a recurring promo
// (e.g. a "free delivery day" in a city) where the donor's zones get set up
// fresh each time and the preset just remembers who the targets are.
const AdministrationShipping = () => {
  usePageTitle("Доставка");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetAllPubsQuery();
  const pubs = useMemo(() => data?.pubs ?? [], [data]);

  const { data: presetsData, isLoading: presetsLoading } = useGetShippingCopyPresetsQuery();
  const presets = useMemo(() => presetsData?.presets ?? [], [presetsData]);
  const [createPreset] = useCreateShippingCopyPresetMutation();
  const [updatePreset] = useUpdateShippingCopyPresetMutation();
  const [markPresetApplied] = useMarkShippingCopyPresetAppliedMutation();
  const [deletePreset] = useDeleteShippingCopyPresetMutation();

  // Same "become this pub's company" flow AdministrationOrders.jsx already
  // uses: fetch a refresh token scoped to that company (sets an httpOnly
  // cookie), clear the admin's own in-memory token so the next request 401s
  // and picks up the new one via the existing auto-refresh path.
  const [getPubToken] = useLazyGetPubRefreshTokenQuery();
  const openPub = (pubID) => {
    getPubToken({ pubID }).then((res) => {
      if (res.data?.ok) {
        setaccesstoken("");
        markSuperAdminImpersonation();
        navigate(`/admin/pub/${pubID}/shipping`);
      }
    });
  };

  const [search, setSearch] = useState("");
  const [donorID, setDonorID] = useState(null);
  const [targetIDs, setTargetIDs] = useState([]);
  const [copyZonesAndPrices, setCopyZonesAndPrices] = useState(true);
  const [copyAvailability, setCopyAvailability] = useState(true);
  const [copyWorkHours, setCopyWorkHours] = useState(false);
  const [copyDeliveryTime, setCopyDeliveryTime] = useState(false);
  const [copyCommission, setCopyCommission] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [editingPresetID, setEditingPresetID] = useState(null);
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const [setShipping] = useSetShippingMutation();
  const [setShippingPrices] = useSetShippingPricesMutation();
  const [setShippingFreeDeliveryPrices] = useSetShippingFreeDeliveryPricesMutation();
  const [setShippingAvailability] = useSetShippingAvailabilityMutation();
  const [setShippingTime] = useSetShippingTimeMutation();
  const [setShippingWorkHours] = useSetShippingWorkHoursMutation();
  const [setAddCommission] = useSetAddCommissionToDishPricesMutation();

  const filteredPubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pubs;
    return pubs.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.copmany_email?.toLowerCase().includes(q)
    );
  }, [pubs, search]);

  const donor = pubs.find((p) => p.id === donorID);
  const donorZoneCount = donor?.shipping?.shapes?.length ?? 0;

  const pubNameByID = useMemo(() => {
    const map = {};
    pubs.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [pubs]);

  const toggleTarget = (id) => {
    setTargetIDs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyToTarget = async (donorPub, target, flags) => {
    setResults((prev) => ({ ...prev, [target.id]: "pending" }));
    try {
      if (flags.copyZonesAndPrices) {
        await setShipping({
          companyID: target.company_id,
          pubID: target.id,
          shapes: donorPub.shipping.shapes,
        }).unwrap();
        await setShippingPrices({
          companyID: target.company_id,
          pubID: target.id,
          prices: donorPub.shipping.shipping_prices,
        }).unwrap();
        await setShippingFreeDeliveryPrices({
          companyID: target.company_id,
          pubID: target.id,
          prices: donorPub.shipping.shipping_free_delivery_prices,
        }).unwrap();
      }
      if (flags.copyAvailability) {
        await setShippingAvailability({
          companyID: target.company_id,
          pubID: target.id,
          available: true,
        }).unwrap();
      }
      if (flags.copyDeliveryTime) {
        await setShippingTime({
          companyID: target.company_id,
          pubID: target.id,
          from: donorPub.shipping.shipping_time_from,
          to: donorPub.shipping.shipping_time_to,
        }).unwrap();
      }
      if (flags.copyWorkHours) {
        await setShippingWorkHours({
          companyID: target.company_id,
          pubID: target.id,
          workHours: donorPub.shipping.shipping_work_hours_for_week,
        }).unwrap();
      }
      if (flags.copyCommission) {
        await setAddCommission({
          companyID: target.company_id,
          pubID: target.id,
          addCommission: donorPub.shipping.add_commission_to_dish_prices,
        }).unwrap();
      }
      setResults((prev) => ({ ...prev, [target.id]: "ok" }));
      return "ok";
    } catch (e) {
      setResults((prev) => ({ ...prev, [target.id]: "error" }));
      return "error";
    }
  };

  const runCopy = async (donorPub, targetIDList, flags) => {
    if (!donorPub || targetIDList.length === 0 || isRunning) {
      return { succeeded: 0, failed: 0 };
    }
    setIsRunning(true);
    setResults({});
    const outcomes = {};
    for (const id of targetIDList) {
      const target = pubs.find((p) => p.id === id);
      if (target) outcomes[id] = await applyToTarget(donorPub, target, flags);
    }
    setIsRunning(false);
    refetch();

    const succeeded = Object.values(outcomes).filter((v) => v === "ok").length;
    const failed = targetIDList.length - succeeded;
    return { succeeded, failed };
  };

  const currentFlags = {
    copyZonesAndPrices,
    copyAvailability,
    copyDeliveryTime,
    copyWorkHours,
    copyCommission,
  };

  const applyAll = async () => {
    if (!donor || targetIDs.length === 0) return;
    const { succeeded, failed } = await runCopy(donor, targetIDs, currentFlags);
    dispatch(
      pushAlert({
        type: failed === 0 ? alertTypes.success : alertTypes.danger,
        header: failed === 0 ? "Готово" : "Скопировано частично",
        message:
          failed === 0
            ? `Доставка скопирована на все ${succeeded} заведени${succeeded === 1 ? "е" : "я"}.`
            : `Успешно: ${succeeded}, с ошибкой: ${failed}. Смотри пометки у каждого заведения ниже.`,
        delay: 6000,
      })
    );
  };

  const applyAllAndSave = async () => {
    if (!donor || targetIDs.length === 0) return;
    const { succeeded, failed } = await runCopy(donor, targetIDs, currentFlags);

    const payload = {
      name:
        presetName.trim() ||
        `${donor.name} → ${targetIDs.length} заведени${targetIDs.length === 1 ? "е" : "я"}`,
      donor_pub_id: donor.id,
      target_pub_ids: targetIDs,
      copy_zones_and_prices: copyZonesAndPrices,
      copy_availability: copyAvailability,
      copy_delivery_time: copyDeliveryTime,
      copy_work_hours: copyWorkHours,
      copy_commission: copyCommission,
    };

    try {
      let savedID = editingPresetID;
      if (editingPresetID) {
        await updatePreset({ id: editingPresetID, ...payload }).unwrap();
      } else {
        const res = await createPreset(payload).unwrap();
        savedID = res?.preset?.id ?? null;
      }
      if (savedID) {
        await markPresetApplied({ id: savedID }).unwrap();
        setEditingPresetID(savedID);
      }
      dispatch(
        pushAlert({
          type: failed === 0 ? alertTypes.success : alertTypes.danger,
          header: failed === 0 ? "Готово" : "Скопировано частично",
          message:
            (failed === 0
              ? `Доставка скопирована на все ${succeeded} заведени${succeeded === 1 ? "е" : "я"}.`
              : `Успешно: ${succeeded}, с ошибкой: ${failed}.`) + " Пресет сохранён в историю.",
          delay: 6000,
        })
      );
    } catch (e) {
      dispatch(
        pushAlert({
          type: alertTypes.danger,
          header: "Скопировано, но не сохранено",
          message: "Копирование выполнено, но не удалось сохранить пресет в историю.",
          delay: 6000,
        })
      );
    }
  };

  const applyPreset = async (preset) => {
    const donorPub = pubs.find((p) => p.id === preset.donor_pub_id);
    if (!donorPub) {
      dispatch(
        pushAlert({
          type: alertTypes.danger,
          header: "Ошибка",
          message: "Заведение-донор этого пресета не найдено (возможно удалено).",
          delay: 6000,
        })
      );
      return;
    }

    const flags = {
      copyZonesAndPrices: preset.copy_zones_and_prices,
      copyAvailability: preset.copy_availability,
      copyDeliveryTime: preset.copy_delivery_time,
      copyWorkHours: preset.copy_work_hours,
      copyCommission: preset.copy_commission,
    };

    const { succeeded, failed } = await runCopy(donorPub, preset.target_pub_ids ?? [], flags);
    try {
      await markPresetApplied({ id: preset.id }).unwrap();
    } catch (e) {
      // Non-critical - the copy itself already ran.
    }
    dispatch(
      pushAlert({
        type: failed === 0 ? alertTypes.success : alertTypes.danger,
        header: failed === 0 ? "Готово" : "Скопировано частично",
        message: `Пресет «${preset.name}»: успешно ${succeeded}, с ошибкой ${failed}.`,
        delay: 6000,
      })
    );
  };

  const editPreset = (preset) => {
    setDonorID(preset.donor_pub_id);
    setTargetIDs(preset.target_pub_ids ?? []);
    setCopyZonesAndPrices(!!preset.copy_zones_and_prices);
    setCopyAvailability(!!preset.copy_availability);
    setCopyDeliveryTime(!!preset.copy_delivery_time);
    setCopyWorkHours(!!preset.copy_work_hours);
    setCopyCommission(!!preset.copy_commission);
    setPresetName(preset.name ?? "");
    setEditingPresetID(preset.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditingPreset = () => {
    setEditingPresetID(null);
    setPresetName("");
  };

  const removePreset = async (preset) => {
    try {
      await deletePreset({ id: preset.id }).unwrap();
      if (editingPresetID === preset.id) {
        cancelEditingPreset();
      }
    } catch (e) {
      dispatch(
        pushAlert({
          type: alertTypes.danger,
          header: "Ошибка",
          message: "Не удалось удалить пресет.",
          delay: 5000,
        })
      );
    }
  };

  if (isLoading) return (
    <>
      <AdministrationNav />
      <div className="p-10 text-center">Загрузка...</div>
    </>
  );

  return (
    <>
    <AdministrationNav />
    <div className="flex flex-col gap-5 py-6 px-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold">Копирование доставки между заведениями</h1>

      {editingPresetID && (
        <div className="flex items-center gap-3 border border-blue-300 bg-blue-50 rounded-lg px-3 py-2 text-sm">
          <span>
            Редактируется пресет: <b>{presetName || `#${editingPresetID}`}</b>
          </span>
          <button
            className="text-blue-600 underline ml-auto"
            onClick={cancelEditingPreset}
          >
            отменить редактирование
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Поиск по названию, адресу или email компании"
        className="border rounded-lg px-3 py-2 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-2">
        {filteredPubs.map((p) => (
          <div
            key={p.id}
            className={`flex items-start gap-2 border rounded-lg p-2 ${
              donorID === p.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col items-center gap-1 pt-1">
              <input
                type="radio"
                name="donor"
                checked={donorID === p.id}
                onChange={() => {
                  setDonorID(p.id);
                  setTargetIDs((prev) => prev.filter((id) => id !== p.id));
                }}
                title="Донор"
              />
              <input
                type="checkbox"
                disabled={donorID === p.id}
                checked={targetIDs.includes(p.id)}
                onChange={() => toggleTarget(p.id)}
                title="Куда копировать"
              />
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-gray-500 truncate">{p.address || "без адреса"}</div>
              <div className="text-xs text-gray-400 truncate">{p.copmany_email}</div>
              <div className="text-xs mt-1">
                {p.shipping?.shapes?.length ? (
                  <span className="text-green-600">{p.shipping.shapes.length} зон(ы)</span>
                ) : (
                  <span className="text-gray-400">нет зон</span>
                )}
                {results[p.id] === "pending" && <span className="ml-2 text-blue-500">копирую...</span>}
                {results[p.id] === "ok" && <span className="ml-2 text-green-600">готово</span>}
                {results[p.id] === "error" && <span className="ml-2 text-red-600">ошибка</span>}
              </div>
              <button
                className="text-xs text-blue-500 underline mt-1"
                onClick={(e) => {
                  e.preventDefault();
                  openPub(p.id);
                }}
              >
                войти в заведение →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        Первая колонка отметок — донор (один), вторая — куда копировать (можно несколько). Донор: {" "}
        <b>{donor ? `${donor.name} (${donorZoneCount} зон)` : "не выбран"}</b>, целей выбрано: <b>{targetIDs.length}</b>
      </div>

      <div className="border rounded-lg p-4 flex flex-col gap-2">
        <div className="font-medium mb-1">Что копировать</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={copyZonesAndPrices} onChange={() => setCopyZonesAndPrices((v) => !v)} />
          Зоны доставки и цены (включая бесплатную доставку от суммы)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={copyAvailability} onChange={() => setCopyAvailability((v) => !v)} />
          Включить доставку у целевых заведений
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={copyDeliveryTime} onChange={() => setCopyDeliveryTime((v) => !v)} />
          Время доставки (от/до)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={copyWorkHours} onChange={() => setCopyWorkHours((v) => !v)} />
          Часы работы доставки по дням недели
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={copyCommission} onChange={() => setCopyCommission((v) => !v)} />
          Включение комиссии в цену блюд
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Название пресета (необязательно)"
          className="border rounded-lg px-3 py-2 flex-1"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={applyAll}
          disabled={!donor || targetIDs.length === 0 || isRunning}
          className={`rounded-lg px-4 py-3 font-medium text-white ${
            !donor || targetIDs.length === 0 || isRunning ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRunning ? "Копирую..." : `Скопировать на ${targetIDs.length} заведени${targetIDs.length === 1 ? "е" : "я"}`}
        </button>
        <button
          onClick={applyAllAndSave}
          disabled={!donor || targetIDs.length === 0 || isRunning}
          className={`rounded-lg px-4 py-3 font-medium text-white ${
            !donor || targetIDs.length === 0 || isRunning ? "bg-gray-300" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {editingPresetID ? "Скопировать и сохранить изменения" : "Скопировать и сохранить в историю"}
        </button>
      </div>

      <hr className="border-gray-300 mt-4" />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">История копирований</h2>
        {presetsLoading && <div className="text-sm text-gray-500">Загрузка истории...</div>}
        {!presetsLoading && presets.length === 0 && (
          <div className="text-sm text-gray-400">
            Пока пусто. Нажми «Скопировать и сохранить в историю», чтобы сохранить текущую настройку как пресет
            и в любой момент применить её снова.
          </div>
        )}
        {presets.map((preset) => (
          <div key={preset.id} className="border rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-gray-500">
                  Донор: <b>{pubNameByID[preset.donor_pub_id] ?? `#${preset.donor_pub_id} (не найден)`}</b>
                  {" · "}
                  Целей: <b>{preset.target_pub_ids?.length ?? 0}</b>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {FLAG_LABELS.filter(([key]) => preset[key])
                    .map(([, label]) => label)
                    .join(", ") || "ничего не выбрано"}
                </div>
                <div className="text-xs text-gray-400">
                  Обновлён: {preset.updated_at_utc}
                  {preset.last_applied_at_utc ? ` · применён: ${preset.last_applied_at_utc}` : " · ещё не применялся"}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="text-xs px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
                  disabled={isRunning}
                  onClick={() => applyPreset(preset)}
                >
                  Применить снова
                </button>
                <button
                  className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                  onClick={() => editPreset(preset)}
                >
                  Изменить
                </button>
                <button
                  className="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => removePreset(preset)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default AdministrationShipping;
