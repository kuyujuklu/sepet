"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isTimeInLocalStorageExpired } from "./store";
import { setBasket, setLastOrder } from "./basketSlice";
import { setLocation, setRequireLocation, requireLocationIfNotSet } from "./locationSlice";

const BasketPreloader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("HEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")

      let basket

      try {
        basket = isTimeInLocalStorageExpired()
          ? {}
          : JSON.parse(localStorage.getItem("basket")) || {};
      } catch (e) {
        basket = {}
      }
      console.log("basket: ", basket)

      let lastOrder;
      try {
        lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || {};
      } catch (e) {
        lastOrder = {}
      }
      let location
      try {
        location = JSON.parse(localStorage.getItem("location")) ?? null
      } catch (e) {
        location = null
      }

      dispatch(setBasket(basket));
      dispatch(setLastOrder({ order: lastOrder }));
      if (location) {
        dispatch(setLocation(location));
      }
      if (location === null) {
        dispatch(requireLocationIfNotSet())
      }
    }
  }, [dispatch]);

  return <></>;
};

export default BasketPreloader;
