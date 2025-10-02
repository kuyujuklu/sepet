import { useDispatch, useSelector } from "react-redux";
import {
  selectNearGeolocation,
  selectNearGeolocationState,
  setHasPermission,
  setNearGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import * as Location from "expo-location";
import { useEffect } from "react";

const GeolocationFinder = () => {
  const dispatch = useDispatch();
  const nearLocation = useSelector(selectNearGeolocation);
  useEffect(() => {
    (async () => {
      if (nearLocation) return;
      const statusObj = await Location.requestForegroundPermissionsAsync();

      if (statusObj.status !== "granted") {
        console.log("NOT GRANTED, CURRENT STATUS: ", statusObj.status)
        dispatch(setHasPermission(false))
        return;
      }

      dispatch(setHasPermission(true))


      console.log("REQUESTING NEAR LOCATION", statusObj)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000,
      });
      console.log("SETTING NEAR LOCATION: ", location.coords)

      if (location) {
        dispatch(
          setNearGeolocation({
            lng: location?.coords?.longitude,
            lat: location?.coords?.latitude,
          }),
        );
      }
    })();
  }, [nearLocation]);
  return <></>;
};

export default GeolocationFinder;
