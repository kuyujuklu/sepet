import { useDispatch, useSelector } from "react-redux";
import {
  selectGeolocation,
  selectNearGeolocation,
  setApproximateGeolocation,
  setHasPermission,
  setNearGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import * as Location from "expo-location";
import { useEffect } from "react";
import { getNearestCity } from "../../shared/utils/cities";

// Turns coordinates into something a person can read. The device geocoder is
// the good case; when it is unavailable (no Google Play services, no network,
// a simulator) we fall back to the nearest city we deliver in, so the top bar
// never has to say "address not set" while we do know roughly where we are.
const describeCoords = async (coords) => {
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

// Bootstraps a location for the whole app.
//
// Selecting an address is no longer mandatory at startup, so this component is
// what makes the product screens usable straight away: it asks for the coarse
// device position and writes it as an *approximate* geolocation. If permission
// is denied nothing is written and the app falls back to the city picker
// (`CityPicker`), which writes the same kind of approximate value.
const GeolocationFinder = () => {
  const dispatch = useDispatch();
  const nearLocation = useSelector(selectNearGeolocation);
  const location = useSelector(selectGeolocation);

  useEffect(() => {
    (async () => {
      if (nearLocation) return;

      const statusObj = await Location.requestForegroundPermissionsAsync();

      if (statusObj.status !== "granted") {
        dispatch(setHasPermission(false));
        return;
      }

      dispatch(setHasPermission(true));

      // Balanced accuracy is enough - this only decides which pubs are nearby
      const deviceLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000,
      });

      const coords = {
        lat: deviceLocation?.coords?.latitude,
        lng: deviceLocation?.coords?.longitude,
      };

      if (!coords.lat || !coords.lng) return;

      dispatch(setNearGeolocation(coords));

      const description = await describeCoords(coords);

      // Ignored by the reducer if the client already has a real address
      dispatch(setApproximateGeolocation({ ...coords, ...description }));
    })();
  }, [nearLocation]);

  // A device position that arrived before the app had any location at all
  useEffect(() => {
    if (location) return;
    if (!nearLocation?.lat || !nearLocation?.lng) return;

    (async () => {
      const description = await describeCoords(nearLocation);

      dispatch(setApproximateGeolocation({ ...nearLocation, ...description }));
    })();
  }, [location, nearLocation]);

  return <></>;
};

export default GeolocationFinder;
