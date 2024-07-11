"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isTimeInLocalStorageExpired } from "./store";
import { setBasket, setLastOrder } from "./basketSlice";

const BasketPreloader = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (typeof window !== "undefined") {
            console.log("HEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")

            let basket = isTimeInLocalStorageExpired()
            ? {}
            : JSON.parse(localStorage.getItem("basket")) || {};
            console.log("basket: ", basket)

            let lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || {};
            dispatch(setBasket(basket));
            dispatch(setLastOrder({order: lastOrder}));
        }
    }, [dispatch]);

    return <></>;
};

export default BasketPreloader;
