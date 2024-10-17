import { useState } from "react"
import CourierAvailableForDeliveryOrdersList from "./CourierAvailableForDeliveryOrdersList"
import CourierActiveOrders from "./CourierActiveOrders"
import CourierCompletedOrders from "./CourierCompletedOrders"

import CourierOrdersFilter, {courierOrderFilters} from "./CourierOrdersFilter"
import { useLocation, useNavigate } from "react-router-dom"

const CourierOrdersPage = ({courierID}) => {
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

export default CourierOrdersPage
