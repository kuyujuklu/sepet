import * as Location from "expo-location";
import { getCityTranslationKey, getNearestCity } from "./cities";

// How the current location is written out for a person. Shared by the top bar
// and by checkout so they never disagree about where the order is going.
//
// Returns null only when we truly know nothing; an approximate location always
// produces something ("Кишинёв", "Рядом с вами"), because "укажите адрес" next
// to a working feed of nearby pubs is simply confusing.
export const getLocationLabel = (location, t) => {
  const parts = [location?.town, location?.fullAddress].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");

  if (location?.cityId) return t(getCityTranslationKey(location.cityId));

  if (location?.lat && location?.lng) return t("header.near_you");

  return null;
};

// Is the address good enough to deliver to? An approximate location has
// coordinates but nobody ever confirmed a street and a house number.
export const isAddressComplete = (location) =>
  !!location?.town && !!location?.fullAddress && !location?.isApproximate;

// Turns coordinates into something a person can read. The device geocoder is
// the good case; when it is unavailable (no Google Play services, no network,
// a simulator) we fall back to the nearest city we deliver in, so the caller
// never has to say "address not set" while we do know roughly where we are.
// Shared by GeolocationFinder (bootstraps the whole app's approximate
// location) and SelectGeolocationInputs (pre-fills the town/street fields
// for a freshly-pinned point, so typing them by hand becomes a correction
// instead of the only way in).
export const describeCoords = async (coords) => {
  const nearestCity = getNearestCity(coords);

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lng,
    });

    if (place) {
      const town = place.city || place.subregion || place.region || null;
      const street = [place.street, place.streetNumber]
        .filter(Boolean)
        .join(" ");

      if (town || street) {
        return {
          town,
          fullAddress: street || null,
          cityId: nearestCity?.id ?? null,
        };
      }
    }
  } catch (e) {
    console.log("reverse geocoding failed: ", e);
  }

  return { town: null, fullAddress: null, cityId: nearestCity?.id ?? null };
};
