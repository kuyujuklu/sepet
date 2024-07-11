import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import {
  selectHasGeolocationPerm,
  selectNearGeolocation,
  selectNearGeolocationState,
  setGeolocation,
  setNearGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner, Text, View } from "native-base";
import { Image, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const mapStyle = {
  map: {
    width: "100%",
    height: "100%",
  },
};
const SelectGeolocation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const [mapLoaded, setMapLoaded] = useState(false);

  const [zoom, setZoom] = useState(18);

  const nearLocation = useSelector(selectNearGeolocation);
  const hasPerm = useSelector(selectHasGeolocationPerm);
  const [center, setCenter] = useState(null);

  const handleSelectLocationByYourself = () => {
    setCenter({ lat: 47.00367, lng: 28.907089 });
    dispatch(setNearGeolocation({ lat: 47.00367, lng: 28.907089 }));
    setZoom(10);
  };

  const handleSetLocationButtonClick = () => {
    console.log("CLLIIIIIIIIIIIIIIIIIIIKC");
    if (!center) return;
    dispatch(setGeolocation({ lat: center.lat, lng: center.lng }));
    navigator.navigate("Home");
  };

  const [selectedRegion, setSelectedRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (!nearLocation) return;
    setCenter(nearLocation);
    setSelectedRegion(getRegion(zoom, nearLocation));
  }, [nearLocation]);

  useEffect(() => {
    if (!mapLoaded || !zoom) return;
    if (!mapRef?.current) return;
    if (!nearLocation) return;

    if (Platform.OS === "android") {
      mapRef.current.animateCamera(
        {
          zoom,
        },
        { duration: 800 },
      );
    } else {
      mapRef.current.animateToRegion(getRegion(15, nearLocation), 800);
    }
  }, [zoom, mapLoaded]);

  useEffect(() => {
    const unsubscribe = navigator.addListener("focus", () => {
      if (!mapRef?.current) return;
      if (!nearLocation) return;

      if (Platform.OS === "android") {
        mapRef.current.animateCamera(
          {
            zoom: 18,
          },
          { duration: 800 },
        );
      } else {
        mapRef.current.animateToRegion(getRegion(15, nearLocation), 800);
      }

      // Return the function to unsubscribe from the event so it gets removed on unmount
      return unsubscribe;
    });
  }, [zoom, navigator]);

  const mapRef = useRef(null);

  return (
    <View flex={1}>
      <View px="4" w="full" flex={1}>
        <View
          w="full"
          rounded="2xl"
          overflow="hidden"
          borderWidth="2"
          borderColor="#ddd"
          flex={1}
          position="relative"
          justifyContent="center"
          alignItems="center"
        >
          {/* No near location screen */}
          {!nearLocation && (
            <View
              style={{ width: "100%", height: "100%" }}
              justifyContent="center"
              alignItems="center"
            >
              {hasPerm && (
                <View h="53%" justifyContent="flex-end">
                  <Spinner size="xl" />
                </View>
              )}
              <View h="47%">
                <Button
                  background={"emerald.600"}
                  borderRadius={15}
                  mt={8}
                  mb={4}
                  onPress={handleSelectLocationByYourself}
                >
                  {t("select_geolocation.select_by_yourself_button")}
                </Button>
              </View>
            </View>
          )}
          {/* Mark to center */}
          <View zIndex={100} position="absolute">
            <View
              style={{
                width: 40,
                height: 80,
              }}
            >
              <Image
                alt="smthng"
                resizeMode="contain"
                style={{ aspectRatio: 1, width: 40, height: 40 }}
                source={require("assets/images/user_marker.png")}
              />
            </View>
          </View>
          {/* Map */}
          {nearLocation && (
            <MapView
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              ref={mapRef}
              onRegionChangeComplete={(e) => {
                console.log("REGION CHANGE COMPLETE");
                setCenter({ lat: e.latitude, lng: e.longitude });
              }}
              style={{ position: "relative", width: "100%", height: "100%" }}
              onMapLoaded={() => {
                setMapLoaded(true);
              }}
              camera={{
                center: {
                  latitude: nearLocation.lat,
                  longitude: nearLocation.lng,
                },
                pitch: 0, // Change this value to set the desired pitch
                heading: 0, // Direction faced by the camera, in degrees clockwise from North.
                zoom: 18,
              }}
              region={Platform.OS === "android" ? undefined : selectedRegion}
            />
          )}
        </View>
        <Button
          disabled={!nearLocation}
          background={!nearLocation ? "coolGray.400" : "emerald.600"}
          borderRadius={15}
          mt={8}
          mb={4}
          onPress={handleSetLocationButtonClick}
        >
          {t("select_geolocation.pin_geolocation")}
        </Button>
      </View>
    </View>
  );
};

const getRegion = (zoom, location) => {
  return {
    latitude: location.lat,
    longitude: location.lng,
    latitudeDelta: getLatLongDelta(zoom, location.lat)[1],
    longitudeDelta: getLatLongDelta(zoom, location.lat)[0],
  };
};

const getLatLongDelta = (zoom, latitude) => {
  const LONGITUDE_DELTA = Math.exp(Math.log(360) - zoom * Math.LN2);
  const ONE_LATITUDE_DEGREE_IN_METERS = 111.32 * 1000;
  const accurateRegion =
    LONGITUDE_DELTA *
    (ONE_LATITUDE_DEGREE_IN_METERS * Math.cos(latitude * (Math.PI / 180)));
  const LATITUDE_DELTA = accurateRegion / ONE_LATITUDE_DEGREE_IN_METERS;

  return [LONGITUDE_DELTA, LATITUDE_DELTA];
};

export default SelectGeolocation;
