import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectOrders } from "./ordersSlice";
import { orderStatuses } from "../../../static-data/data";
import { availableSounds, playSound, soundNames } from "../../sound/soundSlice";

const NewOrdersListener = () => {
    const dispatch = useDispatch();
    const [lastNotHandledOrdersCount, setLastNotHandledOrdersCount] =
        useState(null);

    const orders = useSelector(selectOrders);
    const [checkingOrdersInterval, setCheckingOrdersInterval] = useState(null);

    const playSoundIfHasNewOrders = useCallback(() => {
        if (!orders) return;

        const notHandledOrdersCount = orders?.reduce(
            (acc, order) =>
                (acc += order.status === orderStatuses.notHandled ? 1 : 0),
            0
        );

        if (
            lastNotHandledOrdersCount !== null &&
            notHandledOrdersCount > lastNotHandledOrdersCount
        ) {
            console.log("handled new order");
            dispatch(playSound(soundNames.newOrderSound));
        }

        setLastNotHandledOrdersCount(notHandledOrdersCount);
    }, [dispatch, lastNotHandledOrdersCount, orders]);

    const playSoundIfHasNotHandledOrders = useCallback(() => {
        if (!orders) return;

        const notHandledOrdersCount = orders?.reduce(
            (acc, order) =>
                (acc += order.status === orderStatuses.notHandled ? 1 : 0),
            0
        );

        if (notHandledOrdersCount > 0) {
            dispatch(playSound(soundNames.newOrderSound));
        }
    }, [dispatch, orders]);

    useEffect(() => {
        playSoundIfHasNewOrders();
    }, [orders, playSoundIfHasNewOrders]);

    useEffect(() => {
        if (checkingOrdersInterval) clearInterval(checkingOrdersInterval);

        const newInterval = setInterval(() => {
            playSoundIfHasNotHandledOrders();
        }, 1000 * 60);

        setCheckingOrdersInterval(newInterval)

    }, [playSoundIfHasNotHandledOrders]);

    return <></>;
};

export default NewOrdersListener;
