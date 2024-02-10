import BlackSpinner from "@/app/admin/components/loaders/BlackSpinner";
import { Button } from "@mui/material";
import {
    DrawingManager,
    GoogleMap,
    Marker,
    Polygon,
    useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectShipping } from "./shippingSlice";
import { useSetShippingMutation } from "@/app/admin/api/pub/pub";

const libraries = ["places", "drawing"];

const convertToPolygonShapes = (shapes) => {
    if (!shapes) return [];
    return shapes.map((shape) =>
        shape.vertices.map((vertex) => ({ lat: vertex.lat, lng: vertex.lng }))
    );
};

const convertFromPolygonShapes = (shapes) => {
    if (!shapes) return [];
    return shapes.map((shape) => ({
        vertices: shape.map((vertex) => ({ lat: vertex.lat, lng: vertex.lng })),
    }));
};

const Map = ({ pub }) => {
    const shippingFromState = useSelector(selectShipping);
    const defaultCenter = {
        lat: 47.00556,
        lng: 28.8575,
    };
    const [center, setCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [zoom, setZoom] = useState(7);
    const [loadingPosition, setLoadingPosition] = useState(true);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyAhMM1BfEGmXzCSpIldr-fBL67naXQ-k5I",
        libraries,
    });

    useEffect(() => {
        if (loadError) console.log(loadError);
    }, [loadError]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLoadingPosition(false);
                    setMarkerPosition(pos);
                    setZoom(7);
                },
                () => setLoadingPosition(false)
            );
        }
    }, []);

    const [shapes, setShapes] = useState([]);
    const [shapesChanged, setShapesChanged] = useState(false);

    useEffect(() => {
        if (
            JSON.stringify(shapes) ===
            JSON.stringify(convertToPolygonShapes(shippingFromState.shapes))
        ) {
            setShapesChanged(false);
            return;
        }

        setShapesChanged(true);
    }, [shapes, shippingFromState.shapes]);

    useEffect(() => {
        if (shippingFromState.shapes) {
            const shapes = convertToPolygonShapes(shippingFromState.shapes);
            setShapes(shapes);
        }
    }, [shippingFromState]);

    const [isDeletingPolygon, setIsDeletingPolygon] = useState(false);

    const onMouseUp = (e, index) => {
        if (isDeletingPolygon) {
            setShapes((prev) => prev.filter((_, i) => i !== index));
            setIsDeletingPolygon(false);
            return
        }

        if (polygonResizeVertex) {
            let resizedShape = shapes[polygonResizeVertex.shapeID];

            if (!resizedShape) return;

            resizedShape[polygonResizeVertex.vertex] = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };

            setShapes((prev) => [
                ...prev.filter(
                    (_, index) => index !== polygonResizeVertex.shapeID
                ),
                resizedShape,
            ]);

            setPolygonResizeVertex(null);
        }

        if (polygonResizeNewVertex) {
            let resizedShape = shapes[polygonResizeNewVertex.shapeID];

            if (!resizedShape) return;

            let newLat =
                e.latLng.lat() * 2 -
                resizedShape[polygonResizeNewVertex.newVertexID - 1].lat;
            let newLng =
                e.latLng.lng() * 2 -
                resizedShape[polygonResizeNewVertex.newVertexID - 1].lng;

            resizedShape.splice(polygonResizeNewVertex.newVertexID, 0, {
                lat: newLat,
                lng: newLng,
            });

            setShapes((prev) => [
                ...prev.filter(
                    (_, index) => index !== polygonResizeNewVertex.shapeID
                ),
                resizedShape,
            ]);

            setPolygonResizeNewVertex(null);
        }
    };

    const polygonOptions = {
        fillOpacity: 0.3,
        fillColor: "#ff0000",
        strokeColor: "#ff0000",
        strokeWeight: 2,
        editable: true,
    };

    const drawingManagerOptions = {
        polygonOptions: polygonOptions,
        drawingControl: true,

        drawingControlOptions: {
            position: window.google?.maps?.ControlPosition?.TOP_CENTER,
            drawingModes: isDeletingPolygon
                ? []
                : [window.google?.maps?.drawing?.OverlayType?.POLYGON],
        },
    };

    const onOverlayComplete = (event) => {
        let shape = event.overlay
            .getPath()
            .getArray()
            .map((a) => ({ lat: a.lat(), lng: a.lng() }));

        event.overlay?.setMap(null);

        if (shape.length < 3) return;
        console.log(shape);

        setShapes((prev) => [...prev, shape]);
    };

    const [setShipping] = useSetShippingMutation();

    const saveShapes = () => {
        const finalShapes = convertFromPolygonShapes(shapes);
        setShipping({
            shapes: finalShapes,
            pubID: pub.id,
            companyID: pub.company_id,
        });
    };

    const [polygonResizeVertex, setPolygonResizeVertex] = useState(null);
    const [polygonResizeNewVertex, setPolygonResizeNewVertex] = useState(null);
    const polygonOnMouseDown = (e, id) => {
        if (e.vertex === undefined && e.edge === undefined) return;

        if (e.edge !== undefined) {
            console.log("edge: ", e.edge);
            setPolygonResizeNewVertex({ shapeID: id, newVertexID: e.edge + 1 });
        }
        if (e.vertex !== undefined) {
            setPolygonResizeVertex({ shapeID: id, vertex: e.vertex });
        }
    };

    return isLoaded ? (
        <>
            {/* Headline */}
            <h1 className="text-bold text-center text-lg font-medium mb-4">
                <span className="block">Select areas where you can ship the food</span>
                {!markerPosition &&
                    !loadingPosition &&
                    <span className="p-3 text-xs font-normal">We could not load position, but you can select areas by your hand</span>}
            </h1>

            {/* Map */}
            <div
                className="rounded-3xl overflow-hidden m-auto shadow-2xl border border-gray-200"
                style={{ position: "relative", maxWidth: "800px" }}
            >
                {loadingPosition ? (
                    <div
                        className="flex gap-10 justify-center items-center"
                        style={{ height: "450px" }}
                    >
                        {!navigator.geolocation ? (
                            <span className="text-xl font-bold">
                                Please press allow on the top of screen to continue
                            </span>
                        ) : (
                            <span className="text-xl font-bold">
                                Wait, we are loading your geolocation
                                <br />
                                If there is a allow button on the top of the screent press it to continue
                            </span>
                        )}

                        <BlackSpinner />
                    </div>
                ) : (
                    <GoogleMap
                        zoom={zoom}
                        center={center}
                        onClick={() => {
                            setIsDeletingPolygon(false);
                        }}
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
                        mapContainerStyle={{ width: "100%", height: "400px" }}
                        onTilesLoaded={() => setCenter(null)}
                    >
                        {markerPosition && <Marker position={markerPosition} />}

                        {/* POLYGONS */}
                        {shapes.map((shape, id) => (
                            <Polygon
                                draggable={false}
                                key={JSON.stringify(shape)}
                                path={shape}
                                options={{
                                    ...polygonOptions,
                                }}
                                onMouseUp={(e) => onMouseUp(e, id)}
                                onMouseDown={(e) => polygonOnMouseDown(e, id)}
                            />
                        ))}

                        {/* DRAWING MANAGER */}
                        {!isDeletingPolygon && (
                            <DrawingManager
                                onOverlayComplete={onOverlayComplete}
                                options={drawingManagerOptions}
                            />
                        )}
                    </GoogleMap>
                )}
            </div>

            {/* Buttons */}
            <div className="flex  gap-3 m-auto" style={{ maxWidth: "800px" }}>
                <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        bgcolor: isDeletingPolygon
                            ? "#7f1d1d"
                            : "rgb(239 68 68)",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        padding: ".7rem 1rem",
                        borderRadius: "10px",
                        width: "fit-content%",
                        margin: "15px 0 0  0",
                        ":hover": {
                            bgcolor: isDeletingPolygon
                            ? "#7f1d1d"
                            : "rgb(239 68 68)",
                        },
                    }}
                    onClick={() => {
                        setIsDeletingPolygon(!isDeletingPolygon);
                    }}
                >
                    Select and delete area
                </Button>
                {shapesChanged && (
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "#3b82f6",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".7rem 1rem",
                            borderRadius: "10px",
                            width: "fit-content%",
                            margin: "15px 0 0  0",
                            ":hover": {
                                bgcolor: "#2563eb",
                            },
                        }}
                        onClick={saveShapes}
                    >
                        Save all
                    </Button>
                )}
            </div>
        </>
    ) : (
        <BlackSpinner />
    );
};

export default Map;
