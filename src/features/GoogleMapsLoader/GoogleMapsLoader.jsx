import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { googleMapsApiSetIsLoaded, googleMapsApiSetLoadError } from "./googleMapsSlice";

const libraries = ["places"];

const GoogleMapsLoader = () => {

    const dispatch = useDispatch()

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyDewxZSRZGrEek6CmiGGi2ps2CNlZIr8Qc",
        libraries,
      });

      useEffect(() =>{
        dispatch(googleMapsApiSetIsLoaded(isLoaded))
        dispatch(googleMapsApiSetLoadError(loadError))
      }, [dispatch, isLoaded, loadError])

    return (
    <>
    </>
)
}

export default GoogleMapsLoader