import { useDispatch } from "react-redux";
import {
  setGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import * as Location from "expo-location";
import { useEffect } from "react";

const GeolocationFinder = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    
    setInterval(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          maximumAge: 10000,
        });
        
        dispatch(
          setGeolocation({
            lng: location.coords.longitude,
            lat: location.coords.latitude,
          })
        );
      })();
    }, 20000)
  }, []);
  return <></>;
};

export default GeolocationFinder;
