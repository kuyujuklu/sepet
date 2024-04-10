import {
    CREATE_EVENT_TYPE,
    GET_ALL_EVENT_TYPE,
    UPDATE_EVENT_TYPE,
    subscribeOnOrdersWebSocket,
} from "@/app/admin/api/orders/orders-ws";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addOrder, setOrders, updateOrder } from "./ordersSlice";

const OrdersPreloader = ({ companyID, pubID }) => {
    const dispatch = useDispatch();

    const handleWebSocketData = useCallback((ordersData) => {
        if (!ordersData) return;

        const eventType = ordersData.event_type;
        switch (eventType) {
            case CREATE_EVENT_TYPE:
                dispatch(addOrder({ order: ordersData.order }));
                break;
            case GET_ALL_EVENT_TYPE:
                dispatch(setOrders({ orders: ordersData.orders }));
                break;
            case UPDATE_EVENT_TYPE:
                dispatch(updateOrder({ order: ordersData.order }));
                break;
        }
    }, [dispatch]);

    const setConnectionState = (connectionState) => {
        console.log("connection state", connectionState)
    }

    useEffect(() => {
        subscribeOnOrdersWebSocket(companyID, pubID, handleWebSocketData, setConnectionState);
    }, [companyID, handleWebSocketData, pubID]);

    return <></>;
};

export default OrdersPreloader;
