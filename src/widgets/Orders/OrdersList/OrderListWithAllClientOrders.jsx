import { useEffect } from "react"
import { useGetAllOrdersForClientQuery } from "../../../shared/api/ordersApi/ordersApi"
import OrderList from "./OrderList"

export const OrderListWithAllClientOrders = () => {
  const {data: ordersResponse, error: ordersError, isLoading} = useGetAllOrdersForClientQuery()
  useEffect(() => {
    if(!ordersError) return;

    console.log("ordersResponse error", ordersError)    
  }, [ordersError])

  useEffect(() => {
    console.log("ordersResponse: ", ordersResponse)
  }, [ordersResponse])

  
  return (
    <>
      <OrderList orders={ordersResponse?.orders} />
    </>
  )
}
