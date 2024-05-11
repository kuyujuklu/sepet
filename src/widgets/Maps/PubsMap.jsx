import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Spinner, View } from "native-base";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import PubMarker from "./PubMarker";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { Image } from "react-native";

const PubsMap = ({ selectPub, selectedPub }) => {
  const location = useSelector(selectGeolocation);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data, error } = useGetNearbyPubsQuery({
    coords: { lat: location.lat, lng: location.lng },
  });

  // Log error on getting nearby pubs error from api
  useEffect(() => {
  }, [error]);

  // Log info on getting nearby pubs data from api
  useEffect(() => {
  }, [data]);

  const mapRef = useRef(null);

  // Animate map on changing selected pub
  useEffect(() => {
    if (!selectedPub) return;
    if (!mapLoaded) return;

    const pub = data?.pubs?.find((pub) => pub.id === selectedPub);

    if (!pub) return;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: pub.lat,
          longitude: pub.lng,
        },
        pitch: 0, // Change this value to set the desired pitch
        heading: 0, // Direction faced by the camera, in degrees clockwise from North.
        zoom: 13,
      },
      { duration: 800 },
    );
  }, [selectedPub, mapLoaded]);

  // Animate marker on changing geolocation
  useEffect(() => {
    if (!mapLoaded) return;
    if (!location) return;
    if (selectedPub) return;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        pitch: 0, // Change this value to set the desired pitch
        heading: 0, // Direction faced by the camera, in degrees clockwise from North.
        zoom: 10,
      },
      { duration: 800 },
    );
  }, [location, selectedPub]);

  return (
    <View px="4" w="full">
      <View
        w={"full"}
        rounded="2xl"
        overflow={"hidden"}
        borderWidth={"2"}
        borderColor={"#ddd"}
      >
        {!location && <Spinner size="lg" />}
        {location && (
          <MapView
            provider={PROVIDER_GOOGLE}
            onMapLoaded={() => {
              setMapLoaded(true);
            }}
            camera={{
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              pitch: 0, // Change this value to set the desired pitch
              heading: 0, // Direction faced by the camera, in degrees clockwise from North.
              zoom: 7,
            }}
            ref={mapRef}
            style={mapStyle.map}
          >
            {data?.pubs?.map((pub) => {
              if (!pub.lat || !pub.lng) return <></>;

              return (
                <PubMarker
                  key={pub.id}
                  onPress={() => selectPub(pub.id)}
                  isSelected={selectedPub === pub.id}
                  name={pub.name}
                  lat={pub.lat}
                  lng={pub.lng}
                />
              );
            })}

            {/* Client geolocation marker */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
                style={{ elevation: 10 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                  }}
                >
                  <Image
                    alt="smthng"
                    resizeMode="contain"
                    style={{ aspectRatio: 1, width: "100%", height: "100%" }}
                    source={require("assets/images/user_marker.png")}
                  />
                </View>
              </Marker>
            )}
          </MapView>
        )}
      </View>
    </View>
  );
};

const mapStyle = {
  map: {
    width: "100%",
    height: "100%",
  },
};

export default PubsMap;
