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
import { describeCoords } from "../../shared/utils/geolocation";

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

      const description = await describeCoords(dispatch, coords);

      // Ignored by the reducer if the client already has a real address
      dispatch(setApproximateGeolocation({ ...coords, ...description }));
    })();
  }, [nearLocation]);

  // A device position that arrived before the app had any location at all
  useEffect(() => {
    if (location) return;
    if (!nearLocation?.lat || !nearLocation?.lng) return;

    (async () => {
      const description = await describeCoords(dispatch, nearLocation);

      dispatch(setApproximateGeolocation({ ...nearLocation, ...description }));
    })();
  }, [location, nearLocation]);

  return <></>;
};

export default GeolocationFinder;
