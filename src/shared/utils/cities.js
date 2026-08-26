// Coarse coordinates of the cities we deliver in.
//
// They are used as an approximate location so that the product screens can be
// shown before the client types a real address: every nearby-* endpoint only
// needs lat/lng. The exact address is asked for at checkout.
//
// Hardcoded because the backend has no city dictionary - see the Backend gaps
// section of changes/2026-08-25-sections-and-soft-location.md.
export const cities = [
  { id: "chisinau", lat: 47.00367, lng: 28.907089 },
  { id: "balti", lat: 47.761, lng: 27.9287 },
  { id: "comrat", lat: 46.2969, lng: 28.6569 },
  { id: "cahul", lat: 45.9075, lng: 28.1944 },
  { id: "orhei", lat: 47.3831, lng: 28.8231 },
  { id: "ungheni", lat: 47.2089, lng: 27.8006 },
  { id: "ceadir_lunga", lat: 46.0553, lng: 28.8317 },
  { id: "tiraspol", lat: 46.8403, lng: 29.6433 },
];

// Where the app looks first when it knows nothing about the client
export const defaultCity = cities[0];

export const getCityTranslationKey = (cityId) => `cities.${cityId}`;

// Rough distance in km - good enough to answer "which of our cities is this?"
const distanceInKm = (a, b) => {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);

  return Math.sqrt(latKm * latKm + lngKm * lngKm);
};

// The city a pair of coordinates belongs to, or null when it is far from all
// of them. Used to name an approximate location when the device geocoder
// gives us nothing.
export const getNearestCity = (coords, maxDistanceKm = 35) => {
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
