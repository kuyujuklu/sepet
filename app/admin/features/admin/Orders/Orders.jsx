import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectOrders } from "./ordersSlice";
import OrderCard from "./OrderCard";
import { GetUtcDateFromApiTime } from "@/app/utils/time";
import { NavLink } from "react-router-dom";
import { orderStatuses } from "@/app/admin/static-data/data";

const Orders = () => {
    const orders = useSelector(selectOrders);

    const sortedOrders = useMemo(() => {
      const sorted = JSON.parse(JSON.stringify(orders))
      sorted.sort(
        (a, b) =>
            GetUtcDateFromApiTime(b.created_time).getTime() -
            GetUtcDateFromApiTime(a.created_time).getTime()
      )
      return sorted
    }, [orders])

    const notCompletedOrders = useMemo(() => {
        if(!orders) return 0;
        return orders.reduce((acc, item) => acc + (item.status !== orderStatuses.completed ? 1 : 0), 0)
    }, [orders])

    return (
        <div className="flex flex-col gap-3 justify-center items-center m-auto" style={{maxWidth: 900}}>
        <h1 className="text-center text-gray-800 text-xl font-bold mt-2">Orders</h1>


            {(!sortedOrders || sortedOrders?.length === 0) && (
                <span className="font-bold text-lg">
                    You have no orders yet
                </span>
            )}
            { sortedOrders && <>
                activeOrders: {notCompletedOrders}
                {sortedOrders
                    .map((item) => (
                        <NavLink key={item.id} to={`/admin/pub/${item.pub_id}/order/${item.id}`} className="cursor-pointer w-full block">
                          <OrderCard order={item} />
                        </NavLink>
                    ))}
            </>}
        </div>
    );
};

export default Orders;
