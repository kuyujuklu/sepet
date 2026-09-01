import { geoApi } from "../api/geo/geoApi";

// The geo dictionary and the two geocoding calls, usable outside a component.
//
// `shared/utils/cities.js` used to hold a hardcoded table of eight cities with
// hand-measured coordinates; it is now GET /api/client/geo/cities. These
// helpers dispatch the RTK Query endpoints directly so the non-React callers
// (describeCoords, checkout) hit the same cache the hooks do - a city list is
// fetched once per session, not once per caller.

const nameFieldByLanguage = {
  ru: "name_ru",
  ro: "name_ro",
  gz: "name_gz",
};

export const getCityName = (city, language) => {
  if (!city) return "";

  const field = nameFieldByLanguage[language] ?? nameFieldByLanguage.ru;

  return city[field] || city.name_ru || city.slug;
};

// Rough distance in km - good enough to answer "which of our cities is this?"
const distanceInKm = (a, b) => {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);

  return Math.sqrt(latKm * latKm + lngKm * lngKm);
};

// The city a pair of coordinates belongs to, or null when it is far from all
// of them. Used to name an approximate location when geocoding gives us
// nothing.
export const findNearestCity = (cities = [], coords, maxDistanceKm = 35) => {
  if (!coords?.lat || !coords?.lng) return null;

  let nearest = null;
  let nearestDistance = Infinity;

  for (const city of cities) {
    const distance = distanceInKm(coords, city);

    if (distance < nearestDistance) {
      nearest = city;
      nearestDistance = distance;
    }
  }

  return nearestDistance <= maxDistanceKm ? nearest : null;
};

// Every one of these resolves to null instead of throwing: the geocoder is a
// convenience everywhere it is used, never the thing an action depends on.
export const fetchCities = async (dispatch) => {
  const result = await dispatch(geoApi.endpoints.getCities.initiate())
    .unwrap()
    .catch(() => null);

  return result?.cities ?? [];
};

export const reverseGeocode = async (dispatch, coords) => {
  if (!coords?.lat || !coords?.lng) return null;

  return await dispatch(
    geoApi.endpoints.reverseGeocode.initiate({
      lat: coords.lat,
      lng: coords.lng,
    }),
  )
    .unwrap()
    .catch(() => null);
};

// Forward geocoding: what stops an order from travelling with city-level
// coordinates when the client typed a real street.
export const geocodeAddress = async (dispatch, query) => {
  if (!query?.trim()) return null;

  return await dispatch(geoApi.endpoints.searchPlace.initiate({ query }))
    .unwrap()
    .catch(() => null);
};
