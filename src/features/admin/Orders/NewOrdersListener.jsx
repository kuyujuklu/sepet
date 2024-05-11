import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectOrders } from "./ordersSlice";
import { orderStatuses } from "../../../static-data/data";
import { availableSounds, playSound, soundNames } from "../../sound/soundSlice";

const NewOrdersListener = () => {
    const dispatch = useDispatch()
    const [lastNotHandledOrdersCount, setLastNotHandledOrdersCount] =
        useState(null);

    const orders = useSelector(selectOrders);

    useEffect(() => {
        if (!orders) return;
        const notHandledOrdersCount = orders?.reduce(
            (acc, order) =>
                (acc += order.status === orderStatuses.notHandled ? 1 : 0),
            0
        );

        if (lastNotHandledOrdersCount !== null && notHandledOrdersCount > lastNotHandledOrdersCount) {
            console.log("handled new order")
            dispatch(playSound(soundNames.newOrderSound))
        }

        setLastNotHandledOrdersCount(notHandledOrdersCount);
    }, [orders]);

    return <></>;
};

export default NewOrdersListener;
