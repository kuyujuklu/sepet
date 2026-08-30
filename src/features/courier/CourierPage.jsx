import { Route, Routes, useNavigate, useNavigation } from "react-router-dom"
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

const CourierPage = () => {
    const dispatch=useDispatch()
    const {data: courierData, error: courierError, isLoading: isCourierLoading} = useGetCourierQuery()


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
            <div className="w-full pb-20">
                <CourierHeader balance={courierData?.courier?.balance} courierID={courierData?.courier?.id} courierName={courierData?.courier?.full_name} />
                <Routes>
                    <Route path="/" element={<RedirectToProfile />} />
                    <Route path="/profile" element={<CourierProfile courierID={courierData?.courier?.id} />} />
                    <Route path="/orders/*" element={<CourierOrdersPage courierID={courierData?.courier?.id} />} />
                </Routes>
                <CourierOrdersPreloader />
                <div style={{
                  position: "fixed",
                  bottom: "0",
                  width: "100%",
                  left: "0",
                  zIndex: 50
                }}>
                  <CourierNavbar />
                </div>
            </div>
  )
}

const RedirectToProfile= () =>{ 
    const navigate = useNavigate()
    navigate("/courier/profile")
    return (<></>)
}

export default CourierPage
