"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isTimeInLocalStorageExpired } from "./store";
import { setBasket, setLastOrder } from "./basketSlice";
import { setGeoCoords, setManualAddress, requireLocationIfNotSet } from "./locationSlice";
import { getBrowserGeolocation } from "../../../utils/browserGeolocation";

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
      let geoCoords
      try {
        geoCoords = JSON.parse(localStorage.getItem("geoCoords")) ?? null
      } catch (e) {
        geoCoords = null
      }
      // Same key the landing page's ChooseLocation.jsx writes when the
      // client corrects a reverse-geocoded guess by hand.
      let manualAddress
      try {
        manualAddress = JSON.parse(localStorage.getItem("manualAddress")) ?? null
      } catch (e) {
        manualAddress = null
      }

      dispatch(setBasket(basket));
      dispatch(setLastOrder({ order: lastOrder }));
      if (geoCoords) {
        dispatch(setGeoCoords(geoCoords));
      }
      if (manualAddress) {
        dispatch(setManualAddress(manualAddress));
      }

      // Landing on a pub page directly (a shared link) skips Main.jsx
      // entirely, so nothing has asked the browser for a position yet -
      // try here too, same "only on a first-ever visit" rule. A real
      // position found this way means the client doesn't have to be
      // interrupted with the address popup at all.
      if (!geoCoords) {
        getBrowserGeolocation().then((coords) => {
          if (!coords) {
            dispatch(requireLocationIfNotSet())
            return
          }

          try {
            localStorage.setItem("geoCoords", JSON.stringify(coords))
          } catch (e) {
            console.log("err writing geoCoords to loc stor: ", e)
          }

          dispatch(setGeoCoords(coords))
        })
      }
    }
  }, [dispatch]);

  return <></>;
};

export default BasketPreloader;
