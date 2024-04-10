import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { googleMapsApiSetIsLoaded, googleMapsApiSetLoadError } from "./googleMapsSlice";

const libraries = ["places", "drawing"];

const GoogleMapsLoader = () => {

    const dispatch = useDispatch()

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyAhMM1BfEGmXzCSpIldr-fBL67naXQ-k5I",
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