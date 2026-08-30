import { latlng_for_location, ro_translates, ru_translates } from "../static-data/data";

// Rough distance in km - good enough to answer "which of our towns is this
// nearest to?" (mirrors the mobile app's shared/utils/cities.js distanceInKm)
const distanceInKm = (a, b) => {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);

  return Math.sqrt(latKm * latKm + lngKm * lngKm);
};

// Fallback when the geocoder is unreachable/slow: the nearest of our own 31
// fixed town centers, same idea as mobile's getNearestCity - just town-level,
// no street. Kept local rather than moved to the backend's `geo/cities`,
// which is a coarse 8-city national list and would resolve a village to a
// city 30 km away.
const getNearestTownLabel = (coords, lang, maxDistanceKm = 35) => {
  if (!coords?.lat || !coords?.lng) return null;

  let nearestId = null;
  let nearestDistance = Infinity;

  for (const [id, point] of Object.entries(latlng_for_location)) {
    const distance = distanceInKm(coords, point);
    if (distance < nearestDistance) {
      nearestId = id;
      nearestDistance = distance;
    }
  }

  if (nearestDistance > maxDistanceKm || !nearestId) return null;

  const translates = lang === "ro" ? ro_translates : ru_translates;
  return { town: translates[nearestId] ?? nearestId, fullAddress: "" };
};

// Reverse geocoding through our own backend (`/api/client/geo/reverse`),
// which calls Google Maps with a server-side key. This used to call OSM
// Nominatim straight from the browser, whose usage policy caps at ~1
// request/sec and asks that production traffic self-host - and which
// answered with a different, less precise address than the one the app and
// the couriers see, since the backend has always geocoded through Google.
// One geocoder now, one answer.
const GEO_REVERSE_URL = "/api/client/geo/reverse";

const fetchWithTimeout = (url, { timeout = 6000, ...options } = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
};

// {lat, lng} -> {town, fullAddress} (a street + house line, or "" when the
// geocoder has none) or null when nothing usable came back at all - callers
// should fall back to a manual address form in that case.
export const reverseGeocode = async (coords, lang = "ru") => {
  if (!coords?.lat || !coords?.lng) return null;

  try {
    const resp = await fetchWithTimeout(
      `${GEO_REVERSE_URL}?lat=${coords.lat}&lng=${coords.lng}`,
    );

    if (!resp.ok) throw new Error(`geo/reverse ${resp.status}`);

    const data = await resp.json();
    if (!data?.ok || !data?.town) return getNearestTownLabel(coords, lang);

    // `street` is the street + house line; `address` is the whole formatted
    // address, which repeats the town - the street line is what the checkout
    // shows next to a separate town field.
    return { town: data.town, fullAddress: data.street ?? "" };
  } catch (e) {
    console.log("reverseGeocode failed, falling back to nearest town: ", e);
    return getNearestTownLabel(coords, lang);
  }
};
