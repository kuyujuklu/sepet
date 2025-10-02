import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Spinner, View } from "native-base";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import PubMarker from "./PubMarker";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { Image, Platform } from "react-native";

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const PubsMap = ({ selectPub, selectedPub }) => {
  const location = useSelector(selectGeolocation);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data, error } = useGetNearbyPubsQuery(
    {
      coords: { lat: location.lat, lng: location.lng },
    },
    { pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const [selectedRegion, setSelectedRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Log error on getting nearby pubs error from api
  useEffect(() => { }, [error]);

  const pubs = useMemo(() => {
    if (!data?.pubs) return [];
    const pubs = data.pubs;
    return pubs;
  }, [data]);

  const mapRef = useRef(null);

  // Animate map on changing selected pub
  useEffect(() => {

    if (!mapRef.current) return;
    //on fucking ios mapLoaded not working
    if (Platform.OS === "android" && !mapLoaded) return;

    const pub = pubs?.find((pub) => pub.id === selectedPub);

    if (!pub || !pub.lat || !pub.lng) return;

    if (Platform.OS === "android") {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: pub.lat,
            longitude: pub.lng,
          },
          pitch: 0, // Change this value to set the desired pitch
          heading: 0, // Direction faced by the camera, in degrees clockwise from North.
          zoom: 16,
        },
        { duration: 800 },
      );
    }
    //ios
    else {
      mapRef.current.animateToRegion(
        getRegion(15, { lat: pub.lat, lng: pub.lng }),
        800
      );
    }
  }, [selectedPub, mapLoaded, pubs]);

  // Animate marker on changing geolocation
  // useEffect(() => {
  //   if (!mapLoaded) return;
  //   if (!location) return;
  //   if (!selectedPub) return;

  //   if (Platform.OS === "android") {
  //     mapRef.current.animateCamera(
  //       {
  //         center: {
  //           latitude: location.lat,
  //           longitude: location.lng,
  //         },
  //         pitch: 0, // Change this value to set the desired pitch
  //         heading: 0, // Direction faced by the camera, in degrees clockwise from North.
  //         zoom: 10,
  //       },
  //       { duration: 800 }
  //     );
  //   } else {
  //     setSelectedRegion(getRegion(zoom, location));
  //   }
  // }, [location, selectedPub]);

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
            googleRenderer="LEGACY"
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            onMapLoaded={() => {
              setMapLoaded(true);
            }}
            camera={{
              center: {
                latitude: location?.lat || defaultCenter,
                longitude: location?.lng || defaultCenter,
              },
              pitch: 0, // Change this value to set the desired pitch
              heading: 0, // Direction faced by the camera, in degrees clockwise from North.
              zoom: 10,
            }}
            region={Platform.OS === "android" ? undefined : selectedRegion}
            ref={mapRef}
            style={mapStyle.map}
          >
            {pubs?.map((pub) => {
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
            {
              //{location && (
              //  <Marker
              //    tracksViewChanges={false}
              //    coordinate={{
              //      latitude: location.lat,
              //      longitude: location.lng,
              //    }}
              //    style={{}}
              //    zIndex={200}
              //  >
              //    <View
              //      style={{
              //        width: 40,
              //        height: 40,
              //      }}
              //    >
              //      <Image
              //        alt="smthng"
              //        resizeMode="contain"
              //        style={{ aspectRatio: 1, width: "100%", height: "100%" }}
              //        source={require("assets/images/user_marker.png")}
              //      />
              //    </View>
              //  </Marker>
              //)}
            }
          </MapView>
        )}
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

const mapStyle = {
  map: {
    width: "100%",
    height: "100%",
  },
};

export default PubsMap;
