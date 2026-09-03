import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import CourierHeader from "./CourierHeader"
import { useGetCourierQuery } from "../../api/courier/courier"
import CourierProfile from "./profile/CourierProfile"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice"
import CourierOrdersPreloader from "./courier-orders/CourierOrdersPreloader"
import { setCourierOrdersPreloader } from "./courier-orders/courierOrdersSlice"
import CourierNavbar from "./CourierNavbar"
import CourierOrdersPage from "./courier-orders/CourierOrdersPage"
import CourierNativeBridge from "./CourierNativeBridge"

const CourierPage = () => {
    const dispatch=useDispatch()
    const location = useLocation()
    const {data: courierData, error: courierError, isLoading: isCourierLoading} = useGetCourierQuery()

    // The order-detail screen is a full-screen drill-in (own back-chevron
    // header, like the mockup) - the persistent identity bar/bottom nav
    // would be redundant chrome on top of it.
    const isDetailPage = /^\/courier\/orders\/\d+$/.test(location.pathname)


  //Check if is unauthorized
  useEffect(() => {
    if(!courierError) return;
    dispatch(setReceivingError({errorKey: errorKeys.get_courier_info, error: courierError}))
  }, [courierError, dispatch])

  useEffect(() => {
    if(!courierData || !courierData.courier) return;
    dispatch(setCourierOrdersPreloader({courierID: courierData.courier.id}))
  }, [courierData, dispatch])

  return (
            <div className={`w-full ${isDetailPage ? "" : "pb-20"}`}>
                <CourierNativeBridge courierID={courierData?.courier?.id} />
                {!isDetailPage && (
                  <CourierHeader balance={courierData?.courier?.balance} courierID={courierData?.courier?.id} courierName={courierData?.courier?.full_name} />
                )}
                <Routes>
                    <Route path="/" element={<RedirectToProfile />} />
                    <Route path="/profile" element={<CourierProfile courierID={courierData?.courier?.id} />} />
                    <Route path="/orders/*" element={<CourierOrdersPage courierID={courierData?.courier?.id} />} />
                </Routes>
                <CourierOrdersPreloader />
                {!isDetailPage && (
                  <div style={{
                    position: "fixed",
                    bottom: "0",
                    width: "100%",
                    left: "0",
                    zIndex: 50
                  }}>
                    <CourierNavbar />
                  </div>
                )}
            </div>
  )
}

const RedirectToProfile= () =>{ 
    const navigate = useNavigate()
    navigate("/courier/profile")
    return (<></>)
}

export default CourierPage
