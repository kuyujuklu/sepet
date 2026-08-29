"use client"

import { useEffect } from "react";
import { setData } from "../../store/pubInfoSlice";
import { useDispatch, useSelector } from "react-redux";
import { setBasketPubID } from "../../store/basketSlice";
import { selectGeoCoords } from "../../store/locationSlice";
import { useGetPubWithShippingPricesQuery } from "../../api/rtk-query/pubs";

const DataToStateUploader = ({ data, pubName }) => {
  const dispatch = useDispatch();

  const geoCoords = useSelector(selectGeoCoords)

  // The client's real position - real device geolocation or a manually
  // placed map pin (see BasketPreloader.jsx). `?? {}` keeps this a safe
  // object to destructure below even while the query itself is skipped for
  // not having one yet.
  const locationLatLng = geoCoords ?? {}
  const {
    data: pubDataWithLocation,
    error: pubErrorWithLocation,
  } = useGetPubWithShippingPricesQuery(
    {
      pubName,
      lat: locationLatLng.lat,
      lng: locationLatLng.lng,
    },
    { skip: !geoCoords || !pubName, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  useEffect(() => {
    if (pubErrorWithLocation) {
      console.log("Pubs error ", pubErrorWithLocation)
    }
  }, [pubErrorWithLocation])

  useEffect(() => {
    if (!pubDataWithLocation) {
      return;
    }
    console.log("Pubs data", pubDataWithLocation)

    dispatch(setData(pubDataWithLocation))

  }, [pubDataWithLocation, dispatch])


  useEffect(() => {
    if (data) dispatch(setData(data));
    if (data?.pub) {
      console.log("set basket pub id", data.pub.url_name);
      dispatch(setBasketPubID(data.pub.url_name));
    }
  }, [data, dispatch]);
  return <></>;
};

export default DataToStateUploader
