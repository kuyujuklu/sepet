import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { geocodeAddress } from "../utils/geo";

// How far a geocoded point is allowed to land from where we already believe
// the client is. Google will happily answer a half-written street with a match
// in another town; accepting that would send the order (and its delivery
// price, which is calculated from the point) somewhere nobody asked for.
const MAX_DRIFT_KM = 50;

const distanceInKm = (a, b) => {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);

  return Math.sqrt(latKm * latKm + lngKm * lngKm);
};

// The coordinates an order should actually travel with.
//
// When the client pinned a point on the map, that point *is* the address and
// nothing needs looking up. When they never did - the location is approximate,
// guessed from the device or picked as a city - the coordinates are the centre
// of a city while the address says "Ленина 88". GET /api/client/geo/search
// turns the typed address back into a point, which is what stops an order from
// being priced and routed against a city centre.
//
// Falls back to the known coordinates on every failure: no geocoder answer, a
// blank address, or a match that drifted implausibly far.
export const useGeocodedAddress = ({ town, fullAddress, location, enabled }) => {
  const dispatch = useDispatch();

  const [coords, setCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // The address as one string; a new one is what re-runs the lookup
  const query = [town, fullAddress].filter(Boolean).join(", ");
  const latestQuery = useRef("");

  useEffect(() => {
    if (!enabled || !town || !fullAddress) {
      setCoords(null);
      return;
    }

    let isActual = true;
    latestQuery.current = query;
    setIsGeocoding(true);

    geocodeAddress(dispatch, query).then((place) => {
      if (!isActual) return;

      setIsGeocoding(false);

      if (!place?.lat || !place?.lng) {
        setCoords(null);
        return;
      }

      if (
        location?.lat &&
        location?.lng &&
        distanceInKm(place, location) > MAX_DRIFT_KM
      ) {
        setCoords(null);
        return;
      }

      setCoords({ lat: place.lat, lng: place.lng });
    });

    return () => {
      isActual = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, enabled]);

  return {
    // What to send: the geocoded point when we got a plausible one, the point
    // we already had otherwise
    coords: coords ?? (location?.lat && location?.lng
      ? { lat: location.lat, lng: location.lng }
      : null),
    isGeocoded: !!coords,
    isGeocoding,
  };
};
