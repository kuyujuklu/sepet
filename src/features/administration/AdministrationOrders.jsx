import { useEffect, useMemo, useState } from "react"
import { useGetAllOrdersQuery, useLazyGetPubRefreshTokenQuery } from "../../api/admin/admin"
import OrderCardForAdmin from "../admin/Orders/OrderCardForAdmin"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setaccesstoken } from "../../api/auth/authBasedQuery"
import { markSuperAdminImpersonation } from "@/utils/superAdminImpersonation"
import AdministrationNav from "./AdministrationNav"
import usePageTitle from "@/hooks/usePageTitle"

const AdministrationOrders = () => {
  usePageTitle("Заказы")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // No admin-wide (cross-company) order websocket exists on the backend -
  // only the per-pub one (/ws/orders/company/:companyID/pub/:pubID), which
  // doesn't fit a screen that spans every company at once. Polling gets the
  // same practical "stays current" result without needing a new backend
  // broadcast channel; skipPollingIfUnfocused means it stops burning
  // requests the moment this tab isn't the one you're looking at.
  const { data: ordersData } = useGetAllOrdersQuery(
    { status: "in-process" },
    { pollingInterval: 10000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true }
  )

  // Per-venue "orders ever" stat - one fetch on mount is enough for this,
  // same pattern as AdministrationPubSettings.jsx's orderCountByPubID.
  const { data: allOrdersData } = useGetAllOrdersQuery({ status: "" })

  const totalOrdersByPubID = useMemo(() => {
    const counts = {}
    for (const order of allOrdersData?.orders ?? []) {
      counts[order.pub_id] = (counts[order.pub_id] ?? 0) + 1
    }
    return counts
  }, [allOrdersData])

  const activeOrdersByPubID = useMemo(() => {
    const counts = {}
    for (const order of ordersData?.orders ?? []) {
      counts[order.pub_id] = (counts[order.pub_id] ?? 0) + 1
    }
    return counts
  }, [ordersData])

  const [getPubToken, { data: getPubTokenData }] = useLazyGetPubRefreshTokenQuery()
  const [selectedPubID, setSelectedPubID] = useState()
  const handleClick = (pubID) => {
    setSelectedPubID(pubID)
    getPubToken({ pubID: pubID })
  }

  useEffect(() => {
    if (!getPubTokenData) return;
    if (getPubTokenData && getPubTokenData.ok === true) {
      setaccesstoken("")
      markSuperAdminImpersonation()
      navigate(`/admin/pub/${selectedPubID}/orders`)
    }
  }, [dispatch, getPubTokenData, navigate, selectedPubID])

  return (
    <>
      <AdministrationNav />
      <div className="mx-auto w-full max-w-[620px] lg:max-w-[1080px] flex flex-col gap-3.5" style={{ padding: "16px 16px 40px" }}>
        <div
          className="flex items-center justify-between gap-3 bg-white rounded-2xl"
          style={{ border: "1px solid #e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: "16px 18px" }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1c2733" }}>Активные заказы</div>
          <div style={{ fontSize: 13, color: "#526070" }}>
            Активных заказов: <b style={{ color: "#1c2733", fontWeight: 700 }}>{ordersData?.orders?.length ?? 0}</b>
          </div>
        </div>

        {(!ordersData?.orders || ordersData.orders.length === 0) && (
          <div style={{ fontSize: 14, color: "#94a3b0" }}>Активных заказов нет</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 14 }}>
          {ordersData?.orders?.map((order) => (
            <OrderCardForAdmin
              key={order.id}
              order={order}
              totalOrdersForPub={totalOrdersByPubID[order.pub_id]}
              activeOrdersForPub={activeOrdersByPubID[order.pub_id]}
              onClick={() => handleClick(order.pub_id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default AdministrationOrders
