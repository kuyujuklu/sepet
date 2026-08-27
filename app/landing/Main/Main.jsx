"use client"
import { useState, useEffect } from "react";
import { getLatLngForLocation } from "../../utils/location";
import { getBrowserGeolocation } from "../../utils/browserGeolocation";
import { sectionIds } from "../../utils/sections";
import Hero from "./Hero";
import Bestsellers from "./Bestsellers";
import PubList from "./PubList";
import ChooseLocation from "./ChooseLocation";
import SectionSwitcher from "./SectionSwitcher";


const Main = () => {
  const [location, setLocation] = useState()
  // The client's real, browser-detected position - takes priority over a
  // picked city's fixed center point (see getLatLngForLocation) whenever we
  // have it, so "nearby" actually means nearby and not "somewhere in town".
  const [geoCoords, setGeoCoords] = useState()
  // True only while the very first, uncached geolocation attempt is in
  // flight - lets ChooseLocation show "Определяем адрес…" instead of
  // silently guessing a city before we actually know anything.
  const [isDetecting, setIsDetecting] = useState(true)
  const [activeSection, setActiveSection] = useState(sectionIds.food)

  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedLocation
    try {
      storedLocation = JSON.parse(localStorage.getItem("location")) ?? null
    } catch (e) {
      storedLocation = null
    }

    let storedGeoCoords
    try {
      storedGeoCoords = JSON.parse(localStorage.getItem("geoCoords")) ?? null
    } catch (e) {
      storedGeoCoords = null
    }

    if (storedLocation) {
      setLocation(storedLocation)
      setIsDetecting(false)
      return
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

  const setLocationAndWriteToLocalStorage = (location) => {
    console.log("set location: ", location)
    try {
      localStorage.setItem("location", JSON.stringify(location))
      // Picking a city by hand is an explicit override - it should win over
      // whatever position was auto-detected earlier, not sit alongside it
      localStorage.removeItem("geoCoords")
    } catch (e) {
      console.log("err writing to loc sotr: ", e)
    }

    setGeoCoords(undefined)
    setLocation(location)
  }

  // Real position when we have it, the picked city's center otherwise - null
  // (not a fallback point) while neither is known yet, so PubList can show
  // "укажите адрес" instead of quietly fetching pubs near nothing.
  const locationLatLng = geoCoords ?? (location ? getLatLngForLocation(location) : null)

  return (
    <div>
      <Hero />
      <Bestsellers />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 32px 64px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            <ChooseLocation
              location={location}
              geoCoords={geoCoords}
              isDetecting={isDetecting}
              setLocation={setLocationAndWriteToLocalStorage}
            />
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <SectionSwitcher activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>

        <PubList locationLatLng={locationLatLng} activeSection={activeSection} />
      </div>
    </div>
  );
};

export default Main;
