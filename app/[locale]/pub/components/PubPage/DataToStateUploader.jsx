"use client"

import { useEffect } from "react";
import { setData, setNearbyPubs } from "../../store/pubInfoSlice";
import { useDispatch, useSelector } from "react-redux";
import { setBasketPubID } from "../../store/basketSlice";
import { selectLocation } from "../../store/locationSlice";
import { useGetPubWithShippingPricesQuery } from "../../api/rtk-query/pubs";
import { getLatLngForLocation } from "../../../../utils/location";

const DataToStateUploader = ({ data, pubName }) => {
  const dispatch = useDispatch();

  const location = useSelector(selectLocation)

  const locationLatLng = getLatLngForLocation(location)
  const {
    data: pubDataWithLocation,
    isLoading: pubIsLoading,
    error: pubErrorWithLocation,
  } = useGetPubWithShippingPricesQuery(
    {
      pubName,
      lat: locationLatLng.lat,
      lng: locationLatLng.lng,
    },
    { skip: !location || !pubName, pollingInterval: 20000, skipPollingIfUnfocused: true },
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
    if (data?.pub?.id) {
      setTimeout(() => {
        window.location = `sepetmd://md?Path=PubInfo&PubID=${data.pub.id}`
      }, 100)
    }
  }, [data])

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
