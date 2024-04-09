import MapView from "react-native-maps";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useState } from "react";
import { View, Spinner } from "react-native";

const SelectGeolocation = () => {
    const [mapLoaded, setMapLoaded] = useState(false);

    const location = useSelector(selectGeolocation);

    return (
        <View>
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
                        ></MapView>
                    )}
                </View>
            </View>
        </View>
    );
};

export default SelectGeolocation;
