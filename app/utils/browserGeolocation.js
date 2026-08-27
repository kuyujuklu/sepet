// Wraps the browser's Geolocation API in a promise that always resolves
// (never rejects) with either real {lat, lng, accuracy} or null - null
// covers every "can't use this" case (no window/SSR, API unsupported,
// permission denied, timed out) so callers never need a try/catch, just an
// `if (coords)`.
//
// enableHighAccuracy asks the device to use GPS when it has one instead of
// the fastest-but-coarsest method (Wi-Fi/cell/IP positioning) - it only
// helps on hardware that actually has GPS (phones/tablets, not a desktop or
// most laptops), and takes a little longer. `accuracy` (meters, from the
// browser itself) is passed through so callers can tell a tight GPS fix from
// a loose Wi-Fi-positioning guess instead of treating every result as
// equally precise.
export const getBrowserGeolocation = ({ timeout = 8000, enableHighAccuracy = true } = {}) => {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => resolve(null),
      { timeout, maximumAge: 5 * 60 * 1000, enableHighAccuracy },
    );
  });
};
