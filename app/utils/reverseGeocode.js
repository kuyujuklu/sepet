import { latlng_for_location, ro_translates, ru_translates } from "../static-data/data";

// Rough distance in km - good enough to answer "which of our towns is this
// nearest to?" (mirrors the mobile app's shared/utils/cities.js distanceInKm)
const distanceInKm = (a, b) => {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);

  return Math.sqrt(latKm * latKm + lngKm * lngKm);
};

// Fallback when Nominatim is unreachable/slow: the nearest of our own 31
// fixed town centers, same idea as mobile's getNearestCity - just town-level,
// no street.
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

// Real reverse geocoding via OSM Nominatim (free, no API key). Its usage
// policy caps at ~1 request/sec and discourages heavy production traffic
// without self-hosting - fine for now, worth revisiting (e.g. Google
// Geocoding API) if this site's traffic grows.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

const fetchWithTimeout = (url, { timeout = 6000, ...options } = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
};

// {lat, lng} -> {town, fullAddress} (a street + house line, or "" when
// Nominatim has none) or null when nothing usable came back at all - callers
// should fall back to getNearestTownLabel/a manual address form in that case.
export const reverseGeocode = async (coords, lang = "ru") => {
  if (!coords?.lat || !coords?.lng) return null;

  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=${lang}&zoom=18&addressdetails=1`;
    const resp = await fetchWithTimeout(url, {
      headers: { "Accept-Language": lang },
    });

    if (!resp.ok) throw new Error(`nominatim ${resp.status}`);

    const data = await resp.json();
    const address = data?.address;
    if (!address) return getNearestTownLabel(coords, lang);

    const town =
      address.city ?? address.town ?? address.village ?? address.municipality;
    const street = address.road;
    const house = address.house_number;

    if (!town) return getNearestTownLabel(coords, lang);

    const fullAddress = [street, house].filter(Boolean).join(" ");

    return { town, fullAddress };
  } catch (e) {
    console.log("reverseGeocode failed, falling back to nearest town: ", e);
    return getNearestTownLabel(coords, lang);
  }
};
