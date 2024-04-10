import { GoogleMap, Marker } from "@react-google-maps/api";
import React, { useEffect } from "react";
import BlackSpinner from "../../components/loaders/BlackSpinner";
import {
    useGetGeolocationQuery,
    useSetGeolocationMutation,
} from "../../api/pub/pub";
import { useSelector } from "react-redux";
import { selectPubID } from "../pub/pubSlice";
import { selectCompanyID } from "../company/companySlice";
import { googleMapSelectIsLoaded } from "../GoogleMapsLoader/googleMapsSlice";

const PinPubsGeolocation = () => {
    const pubID = useSelector(selectPubID);
    const companyID = useSelector(selectCompanyID);

    const isGoogleMapsApiLoaded = useSelector(googleMapSelectIsLoaded);

    const {
        data: geolocationData,
        error: geolocationError,
        isLoading: geolocationIsLoading,
    } = useGetGeolocationQuery(
        { pubID: pubID, companyID: companyID },
        { skip: !pubID || !companyID }
    );

    const isGeolocationValid =
        geolocationData && geolocationData.lat && geolocationData.lng;

    useEffect(() => {
        if (!geolocationData) return;

        console.log(geolocationData);
    }, [geolocationData]);

    useEffect(() => {
        if (!geolocationError) return;

        console.log("geolocationError", geolocationError);
    }, [geolocationError]);

    const [
        setGeolocation,
        {
            data: setGeolocationData,
            error: setGeolocationError,
            isLoading: setGeolocationIsLoading,
        },
    ] = useSetGeolocationMutation();

    const pinPoint = (lat, lng) => {
        console.log("setting geolocation");
        setGeolocation({ companyID, pubID, lat, lng });
    };

    useEffect(() => {
        if (!setGeolocationData) return;

        console.log(setGeolocationData);
    }, [setGeolocationData]);

    useEffect(() => {
        if (!setGeolocationError) return;

        console.log("setGeolocationError", setGeolocationError);
    }, [setGeolocationError]);

    return isGoogleMapsApiLoaded ? (
        <div
            style={{
                width: "100%",
                height: "300px",
                maxWidth: "250px",
                transition: "all .3s ease-in-out",
                overflow: "hidden",
            }}
            className="flex flex-col justify-between relative border  rounded-lg shadow-xl hover:shadow-2xl"
        >
            {/* LOADING SPINNER */}
            <div
                className={`absolute flex justify-center items-center w-full h-full bg-black ${
                    geolocationIsLoading || setGeolocationIsLoading
                        ? "opacity-80"
                        : "opacity-0 hidden"
                }`}
                style={{ zIndex: 100 }}
            >
                <div className="margin-auto">
                    <BlackSpinner />
                </div>
            </div>

            <div
                className=" relative flex flex-col  overflow-hidden pb-3"
                style={{ flex: "1 0 90%" }}
            >
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ flex: "1 0" }}
                >
                    <GoogleMap
                        zoom={7}
                        center={
                            isGeolocationValid
                                ? geolocationData
                                : {
                                      lat: 47.00556,
                                      lng: 28.8575,
                                  }
                        }
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            gestureHandling: "greedy",
                            mapTypeControlOptions: {
                                mapTypeIds: [
                                    window.google?.maps.MapTypeId.ROADMAP,
                                ],
                            },
                        }}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        onDblClick={(e) => {
                            e.latLng &&
                                pinPoint(e.latLng.lat(), e.latLng.lng());
                        }}
                    >
                        {isGeolocationValid && (
                            <Marker
                                position={{
                                    lat: geolocationData.lat,
                                    lng: geolocationData.lng,
                                }}
                            ></Marker>
                        )}
                    </GoogleMap>
                </div>
                <span className="text-center font-medium text-xs mt-2">
                    Pin your geolocation by double clicking on the map
                </span>
            </div>
        </div>
    ) : (
        <BlackSpinner />
    );
};

export default PinPubsGeolocation;
