import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllOrdersQuery, useGetAllPubsQuery, useLazyGetPubRefreshTokenQuery } from "../../api/admin/admin";
import {
  useSetAddCommissionToDishPricesMutation,
  useSetShippingAvailabilityMutation,
} from "../../api/pub/pub";
import { setaccesstoken } from "../../api/auth/authBasedQuery";
import { markSuperAdminImpersonation } from "@/utils/superAdminImpersonation";
import DeliveryTypeInput from "../admin/ShippingAndPreorder/Shipping/DeliveryTypeInput";
import AdministrationNav from "./AdministrationNav";
import usePageTitle from "@/hooks/usePageTitle";

// Superadmin-wide settings for individual pubs, pulled out of the per-pub
// admin screen since they're platform-level calls rather than day-to-day
// pub operations: delivery availability, delivery type (own courier vs the
// shared delivery-service network), and whether delivery-service commission
// gets folded into dish prices. The per-pub Shipping screen shows all three
// read-only now (see Inputs.jsx) - this is the only place they're editable.
const AdministrationPubSettings = () => {
  usePageTitle("Настройки заведений");
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetAllPubsQuery();
  const pubs = useMemo(() => data?.pubs ?? [], [data]);

  // Minimal per-pub stat - just a total order count, no live updates
  // needed for this (see AdministrationOrders.jsx's own comment on why
  // there's no cross-company order websocket); one fetch on mount is
  // enough for "how many orders has this venue ever had".
  const { data: allOrdersData } = useGetAllOrdersQuery({ status: "" });
  const orderCountByPubID = useMemo(() => {
    const counts = {};
    for (const order of allOrdersData?.orders ?? []) {
      counts[order.pub_id] = (counts[order.pub_id] ?? 0) + 1;
    }
    return counts;
  }, [allOrdersData]);

  const [search, setSearch] = useState("");

  const [setAddCommission, { isLoading: isSavingCommission }] =
    useSetAddCommissionToDishPricesMutation();
  const [setAvailability, { isLoading: isSavingAvailability }] =
    useSetShippingAvailabilityMutation();
  const [pendingPubID, setPendingPubID] = useState(null);

  // Same "become this pub's company" flow as AdministrationShipping.jsx's
  // openPub - fetch a refresh token scoped to that company (sets an
  // httpOnly cookie), clear the admin's own in-memory token so the next
  // request 401s and picks up the new one via the existing auto-refresh path.
  const [getPubToken] = useLazyGetPubRefreshTokenQuery();
  const openPub = (pubID) => {
    getPubToken({ pubID }).then((res) => {
      if (res.data?.ok) {
        setaccesstoken("");
        markSuperAdminImpersonation();
        navigate(`/admin/pub/${pubID}/settings`);
      }
    });
  };

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

  // setAddCommission/setAvailability live in a different RTK Query API slice
  // (api/pub/pub.js) than getAllPubs (api/admin/admin.js) - tag invalidation
  // doesn't cross slices, so nothing tells this pub list to refetch after a
  // successful save. Without an explicit refetch, the checkbox's `checked`
  // (bound to the now-stale list) snaps back to its old value the instant
  // React re-renders, which looks exactly like the checkbox doing nothing.
  const toggleCommission = (pub) => {
    setPendingPubID(pub.id);
    setAddCommission({
      companyID: pub.company_id,
      pubID: pub.id,
      addCommission: !pub.shipping?.add_commission_to_dish_prices,
    }).finally(() => {
      setPendingPubID(null);
      refetch();
    });
  };

  const toggleAvailability = (pub) => {
    setPendingPubID(pub.id);
    setAvailability({
      companyID: pub.company_id,
      pubID: pub.id,
      available: !pub.shipping?.available,
    }).finally(() => {
      setPendingPubID(null);
      refetch();
    });
  };

  if (isLoading)
    return (
      <>
        <AdministrationNav />
        <div className="p-10 text-center">Загрузка...</div>
      </>
    );

  return (
    <>
      <AdministrationNav />
      <div className="flex flex-col gap-5 py-6 px-4 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold">Настройки заведений</h1>

        <input
          type="text"
          placeholder="Поиск по названию, адресу или email компании"
          className="border rounded-lg px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          {filteredPubs.map((p) => {
            const isPending =
              (isSavingCommission || isSavingAvailability) && pendingPubID === p.id;
            return (
              <div key={p.id} className="border rounded-lg p-3 flex flex-col gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.address || "без адреса"} · {p.copmany_email}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Заказов всего: <b>{orderCountByPubID[p.id] ?? 0}</b>
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

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      Доставка включена
                    </span>
                    <input
                      type="checkbox"
                      checked={!!p.shipping?.available}
                      disabled={isPending}
                      onChange={() => toggleAvailability(p)}
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      Комиссия в цене блюд
                    </span>
                    <input
                      type="checkbox"
                      checked={!!p.shipping?.add_commission_to_dish_prices}
                      disabled={isPending}
                      onChange={() => toggleCommission(p)}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      Способ доставки
                    </span>
                    <DeliveryTypeInput
                      companyID={p.company_id}
                      pubID={p.id}
                      deliveryType={p.shipping?.delivery_type}
                      onSaved={refetch}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AdministrationPubSettings;
