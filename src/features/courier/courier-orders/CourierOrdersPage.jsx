import CourierAvailableForDeliveryOrdersList from "./CourierAvailableForDeliveryOrdersList"
import CourierActiveOrders from "./CourierActiveOrders"
import CourierCompletedOrders from "./CourierCompletedOrders"

import CourierOrdersFilter, {courierOrderFilters} from "./CourierOrdersFilter"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import CourierOrderDetailPage from "./CourierOrderDetailPage"

const CourierOrdersList = ({courierID}) => {
  const navigate = useNavigate()

  const {state} = useLocation()

  const currentCourierOrdersFilter = state?.ordersFilter ?? courierOrderFilters.available

    const setCurrentCourierOrdersFilter = (value) => {
      navigate(null, {state: {ordersFilter: value}})
    }

  return (
    <div className="flex flex-col items-center w-full justify-center">
      <div className="mb-4">
        <CourierOrdersFilter setFilter={setCurrentCourierOrdersFilter} filter={currentCourierOrdersFilter} />
      </div>
      {
        currentCourierOrdersFilter === courierOrderFilters.active &&
          <CourierActiveOrders courierID={courierID} />
      }
      {
        currentCourierOrdersFilter === courierOrderFilters.available &&
          <CourierAvailableForDeliveryOrdersList courierID={courierID} />
      }
      {
        currentCourierOrdersFilter === courierOrderFilters.completed &&
          <CourierCompletedOrders courierID={courierID} />
      }
    </div>
  )
}

const CourierOrdersPage = ({courierID}) => {
  return (
    <Routes>
      <Route path="/" element={<CourierOrdersList courierID={courierID} />} />
      <Route path="/:orderID" element={<CourierOrderDetailPage courierID={courierID} />} />
    </Routes>
  )
}

export default CourierOrdersPage
