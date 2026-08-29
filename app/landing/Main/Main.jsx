"use client"
import { useState, useEffect } from "react";
import { getBrowserGeolocation } from "../../utils/browserGeolocation";
import { sectionIds } from "../../utils/sections";
import { locations, latlng_for_location } from "../../static-data/data";
import Hero from "./Hero";
import Bestsellers from "./Bestsellers";
import PubList from "./PubList";
import ChooseLocation from "./ChooseLocation";
import SectionSwitcher from "./SectionSwitcher";


const Main = () => {
  // The client's real position - real device geolocation or a manually
  // placed map pin, no way (or need) to tell which apart. The only thing
  // that ever drives nearby-pub search/delivery pricing; picking a city
  // from a list used to be a coordinate-less alternative to this, removed
  // outright (every address now carries a precise coordinate, not just a
  // display string).
  const [geoCoords, setGeoCoords] = useState()
  // True only while the very first, uncached geolocation attempt is in
  // flight - lets ChooseLocation show "Определяем адрес…" instead of
  // silently guessing before we actually know anything.
  const [isDetecting, setIsDetecting] = useState(true)
  const [activeSection, setActiveSection] = useState(sectionIds.food)

  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedGeoCoords
    try {
      storedGeoCoords = JSON.parse(localStorage.getItem("geoCoords")) ?? null
    } catch (e) {
      storedGeoCoords = null
    }

    if (storedGeoCoords) {
      setGeoCoords(storedGeoCoords)
      setIsDetecting(false)
      return
    }

    // Nothing cached at all - ask the browser. No default city is set here
    // on purpose: guessing "Ceadir-Lunga" for everyone regardless of where
    // they actually are (or whether geolocation was even denied) is exactly
    // what looked "stuck"/broken before - see ChooseLocation's "unknown"
    // state, which now asks instead of silently picking for the client.
    getBrowserGeolocation().then((coords) => {
      setIsDetecting(false)
      if (!coords) return

      try {
        localStorage.setItem("geoCoords", JSON.stringify(coords))
      } catch (e) {
        console.log("err writing geoCoords to loc stor: ", e)
      }

      setGeoCoords(coords)
    })
  }, []);

  // A point picked on the map is a real, precise coordinate - exactly like
  // real geolocation, just sourced by hand instead of a sensor - so it goes
  // through this same state/localStorage slot.
  const setMapPointAndWriteToLocalStorage = (coords) => {
    try {
      localStorage.setItem("geoCoords", JSON.stringify(coords))
    } catch (e) {
      console.log("err writing geoCoords to loc stor: ", e)
    }

    setGeoCoords(coords)
  }

  // null (not a fallback point) while nothing is known yet, so PubList can
  // show "укажите адрес" instead of quietly fetching pubs near nothing.
  const locationLatLng = geoCoords ?? null

  return (
    <div>
      <Hero />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 32px 64px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            <ChooseLocation
              geoCoords={geoCoords}
              isDetecting={isDetecting}
              setMapPoint={setMapPointAndWriteToLocalStorage}
              mapDefaultCenter={locationLatLng ?? latlng_for_location[locations.Ceadir_Lunga]}
            />
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <SectionSwitcher activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>

        <Bestsellers locationLatLng={locationLatLng} activeSection={activeSection} />

        <PubList locationLatLng={locationLatLng} activeSection={activeSection} />
      </div>
    </div>
  );
};

export default Main;
