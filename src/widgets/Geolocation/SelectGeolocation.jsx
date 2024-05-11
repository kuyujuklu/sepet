import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGeolocation,
  selectNearGeolocation,
  setGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import { useRef, useState } from "react";
import { Button, Spinner, Text, View } from "native-base";
import { Image } from "react-native";
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

  const nearLocation = useSelector(selectNearGeolocation);
  const [center, setCenter] = useState(null);

  const handleSetLocationButtonClick = () => {
    if (!center) return;
    dispatch(setGeolocation({ lat: center.lat, lng: center.lng }));
    navigator.navigate("Home");
  };

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
          {!nearLocation && (
            <View
              style={{ width: "100%", height: "100%" }}
              justifyContent="center"
              alignItems="center"
            >
              <Spinner size="xl" />
            </View>
          )}
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
          {nearLocation && (
            <MapView
              provider={PROVIDER_GOOGLE}
              ref={mapRef}
              onRegionChangeComplete={(e) =>
                setCenter({ lat: e.latitude, lng: e.longitude })
              }
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
                zoom: 14,
              }}
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

export default SelectGeolocation;
