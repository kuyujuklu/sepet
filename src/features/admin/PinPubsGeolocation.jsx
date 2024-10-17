import { GoogleMap, Marker, MarkerF } from "@react-google-maps/api";
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
import { useTranslation } from "react-i18next";

const PinPubsGeolocation = () => {
    const {t} = useTranslation()
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
        !!(geolocationData && geolocationData.lat && geolocationData.lng);
    useEffect(() => {
        if (!geolocationData) return;

    }, [geolocationData]);

    useEffect(() => {
        if (!geolocationError) return;

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
        setGeolocation({ companyID, pubID, lat, lng });
    };

    useEffect(() => {
        if (!setGeolocationData) return;

    }, [setGeolocationData]);

    useEffect(() => {
        if (!setGeolocationError) return;

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
                            <MarkerF
                                position={{
                                    lat: geolocationData.lat,
                                    lng: geolocationData.lng,
                                }}
                            />
                        )}
                    </GoogleMap>
                </div>
                <span className="text-center font-medium text-xs mt-2">
                    {t("admin.admin_panel.main_page.sections.geolocation.headline")}
                </span>
            </div>
        </div>
    ) : (
        <BlackSpinner />
    );
};

export default PinPubsGeolocation;
