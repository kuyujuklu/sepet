import { latlng_for_location } from "../static-data/data"

const ru_translates = {
  "Kazaklia": "Казаклия",
  "Komrat": "Комрат"
}
const ro_translates = {
  "Kazaklia": "Cazaclia",
  "Komrat": "Comrat"
}


export const getLatLngForLocation = (location) => {
  return latlng_for_location[location] ?? { lat: 0, lng: 0 }

}

export const translateLocation = (location, lang) => {
  if (lang === "ro") {
    return ro_translates[location]
  }
  return ru_translates[location]
}
