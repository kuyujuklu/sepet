import { useDispatch, useSelector } from "react-redux";
import { addCourierOrder, selectCourierOrdersPreloader, setCourierOrders, updateCourierOrder } from "./courierOrdersSlice";
import { useCallback, useEffect } from "react";
import { CREATE_EVENT_TYPE, GET_ALL_EVENT_TYPE, subscribeOnOrdersWebSocket, UPDATE_EVENT_TYPE } from "../../../api/courier/courier-ws";

const CourierOrdersPreloader = () => {
    const dispatch = useDispatch();

    const courierOrdersPreloaderState = useSelector(selectCourierOrdersPreloader);

    const handleWebSocketData = useCallback(
        (ordersData) => {
            if (!ordersData) return;

            const eventType = ordersData.event_type;
            switch (eventType) {
                case CREATE_EVENT_TYPE:
                    dispatch(addCourierOrder({ courierOrder: ordersData.order }));
                    break;
                case GET_ALL_EVENT_TYPE:
                    dispatch(setCourierOrders({ courierOrders: ordersData.orders }));
                    break;
                case UPDATE_EVENT_TYPE:
                    dispatch(updateCourierOrder({ courierOrder: ordersData.order }));
                    break;
                default:
                    break;
            }
        },
        [dispatch]
    );

    const setConnectionState = (connectionState) => {
        console.log("courier connection state", connectionState);
    };

    useEffect(() => {
        subscribeOnOrdersWebSocket(
            courierOrdersPreloaderState.courierID,
            handleWebSocketData,
            setConnectionState
        );
    }, [
        courierOrdersPreloaderState.courierID,
        handleWebSocketData,
    ]);

    return (
    <></>
)
}

export default CourierOrdersPreloader
