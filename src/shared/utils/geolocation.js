import * as Location from "expo-location";
import i18next from "i18next";
import { fetchCities, findNearestCity, getCityName, reverseGeocode } from "./geo";

// How the current location is written out for a person. Shared by the top bar
// and by checkout so they never disagree about where the order is going.
//
// Returns null only when we truly know nothing; an approximate location always
// produces something ("Кишинёв", "Рядом с вами"), because "укажите адрес" next
// to a working feed of nearby pubs is simply confusing. The city name is part
// of `town` now (describeCoords fills it in), so this no longer needs a city
// dictionary of its own.
export const getLocationLabel = (location, t) => {
  const parts = [location?.town, location?.fullAddress].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");

  if (location?.lat && location?.lng) return t("header.near_you");

  return null;
};

// Is the address good enough to deliver to? An approximate location has
// coordinates but nobody ever confirmed a street and a house number.
export const isAddressComplete = (location) =>
  !!location?.town && !!location?.fullAddress && !location?.isApproximate;

// Turns coordinates into something a person can read.
//
// Three sources, in order of how much they know:
//  1. GET /api/client/geo/reverse - Google Maps through our own server, the
//     only one that knows a street number;
//  2. the device geocoder, which still works with no network on iOS and is
//     the fallback when the server has no GOOGLE_MAPS_API_KEY configured;
//  3. the nearest city of the server's city dictionary, so the caller never
//     has to say "address not set" while we do know roughly where we are.
//
// `dispatch` is threaded in (rather than this being a hook) because both
// callers - GeolocationFinder, which bootstraps the whole app's approximate
// location, and SelectGeolocationInputs, which pre-fills the town/street
// fields for a freshly-pinned point - already have one.
export const describeCoords = async (dispatch, coords) => {
  const cities = await fetchCities(dispatch);
  const nearestCity = findNearestCity(cities, coords);
  const cityName = getCityName(nearestCity, i18next.language);

  const fallback = {
    town: cityName || null,
    fullAddress: null,
    cityId: nearestCity?.slug ?? null,
  };

  const place = await reverseGeocode(dispatch, coords);

  if (place?.town || place?.street) {
    return {
      town: place.town || cityName || null,
      fullAddress: place.street || null,
      cityId: nearestCity?.slug ?? null,
    };
  }

  try {
    const [devicePlace] = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lng,
    });

    if (devicePlace) {
      const town =
        devicePlace.city || devicePlace.subregion || devicePlace.region || null;
      const street = [devicePlace.street, devicePlace.streetNumber]
        .filter(Boolean)
        .join(" ");

      if (town || street) {
        return {
          town: town || cityName || null,
          fullAddress: street || null,
          cityId: nearestCity?.slug ?? null,
        };
      }
    }
  } catch (e) {
    console.log("reverse geocoding failed: ", e);
  }

  return fallback;
};
