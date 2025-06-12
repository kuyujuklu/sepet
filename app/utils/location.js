import { latlng_for_location, ro_translates, ru_translates } from "../static-data/data"

export const getLatLngForLocation = (location) => {
  console.log("CONV LOC: ", location)
  return latlng_for_location[location] ?? { lat: 0, lng: 0 }

}

export const translateLocation = (location, lang) => {
  if (lang === "ro") {
    return ro_translates[location]
  }
  return ru_translates[location]
}
