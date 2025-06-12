"use client"
import { useState, useEffect, useMemo } from "react";
import { pubs_api } from "../api/pubsApi";
import PubCard from "./PubCard";
import BlackSpinner from "../../shared-components/loaders/BlackSpinner";

const PubList = ({ locationLatLng }) => {

  const [pubs, setPubs] = useState()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {

    if (!locationLatLng.lat || !locationLatLng.lng) {
      return
    }

    (async function() {
      setIsLoading(true);
      const resp = await pubs_api.getAvailablePubsForLocation({ lat: locationLatLng.lat, lng: locationLatLng.lng });

      setIsLoading(false)
      if (!resp.ok || !resp.pubs) {
        return
      }

      setPubs(resp.pubs);
    })();
  }, [locationLatLng, setPubs]);


  const sortedPubs = useMemo(() => {
    if (!pubs) return []

    let sortedPubs = [...pubs]
    sortedPubs.sort((a, b) => a?.distance - b?.distance)
    return sortedPubs
  }, [pubs])

  return (
    <div className="w-full flex flex-col gap-5 items-center flex-wrap">
      {isLoading && <BlackSpinner />}
      {!isLoading && sortedPubs?.map((pub) => <PubCard key={pub.url_name} pub={pub} />)}
      {!!(locationLatLng.lat && locationLatLng.lng && !isLoading && (!sortedPubs || sortedPubs?.length === 0)) && <div className="text-red-400 text-xl">Мы пока сюда не доставляем :(</div>}
    </div>
  );
};

export default PubList;

