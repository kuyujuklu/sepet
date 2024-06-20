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
  const nearLocaiton = useSelector(selectNearGeolocation);
  useEffect(() => {
    (async () => {
      if (nearLocaiton) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        dispatch(setHasPermission(false))
        return;
      }
      dispatch(setHasPermission(true))


      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 10000,
      });

      dispatch(
        setNearGeolocation({
          lng: location.coords.longitude,
          lat: location.coords.latitude,
        }),
      );
    })();
  }, []);
  return <></>;
};

export default GeolocationFinder;
