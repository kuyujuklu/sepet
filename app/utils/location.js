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

// What to show wherever the client's location appears (the city select on
// the landing page, the "Доставка в:" pill on a pub page, the checkout
// address step) - so a client can actually tell that their real,
// browser-detected position is being used instead of guessing from a city
// name that never changed. geoCoords (real position) takes priority over a
// picked city, matching the priority used to build the lat/lng that is
// actually sent with orders.
export const getLocationDisplayLabel = (location, geoCoords, lang) => {
  if (geoCoords) {
    return lang === "ro" ? "📍 Locația dvs. actuală" : "📍 Ваше местоположение"
  }
  if (location) return translateLocation(location, lang)
  return null
}
