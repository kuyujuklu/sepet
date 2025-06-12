"use client"
import { useState, useEffect } from "react";
import { getLatLngForLocation } from "../../utils/location";
import { locations } from "../../static-data/data";
import PubList from "./PubList";
import ChooseLocation from "./ChooseLocation";


const Main = () => {
  const [location, setLocation] = useState()

  useEffect(() => {
    if (typeof window !== "undefined") {
      let location
      try {
        location = JSON.parse(localStorage.getItem("location")) ?? null
      } catch (e) {
        location = null
      }

      if (location) {
        setLocation(location);
      }
    }
  }, [setLocation]);

  const setLocationAndWriteToLocalStorage = (location) => {
    console.log("set location: ", location)
    try {
      localStorage.setItem("location", JSON.stringify(location))
    } catch (e) {
      console.log("err writing to loc sotr: ", e)
    }

    setLocation(location)
  }


  return (
    <div className="">
      <ChooseLocation location={location} setLocation={setLocationAndWriteToLocalStorage} />
      <PubList locationLatLng={getLatLngForLocation(location)} />
    </div>

  );
};

export default Main;

