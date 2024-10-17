import BlackSpinner from "@/components/loaders/BlackSpinner";
import { Button } from "@mui/material";
import {
    DrawingManager,
    DrawingManagerF,
    GoogleMap,
    Marker,
    Polygon,
    PolygonF,
} from "@react-google-maps/api";
import { v4 as uuid } from "uuid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectShipping } from "./shippingSlice";
import { useSetShippingMutation } from "@/api/pub/pub";
import { googleMapSelectIsLoaded } from "../../../GoogleMapsLoader/googleMapsSlice";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import uniqolor from "uniqolor";

let lastShape = {vertices: [], shape_id: "", color: ""}

function reverseArr(input) {
    var ret = [];
    for(var i = input.length-1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}
const colors = [
    "#DC143C",
    "#9400D3",
    "#7B68EE",
    "#FF1493",
    "#FF4500",
    "#00BFFF",
    "#FFD700",
    "#00FFFF",
    "#00FF7F",
]

const getNotUsedColor = (shapes) => {
    if(!shapes) return colors[0]

    const usedColors = new Set()
    for(let i = 0; i < shapes.length; i++) {
        usedColors.add(shapes[i].color)
    }
    for(let i = 0; i < colors.length; i++) {
        if(!usedColors.has(colors[i])) {
            return colors[i]
        }
    }

    return uniqolor((Math.random() * 20000).toString()).color
}

// const convertToPolygonShapes = (shapes) => {
//     if (!shapes) return [];
//     return shapes.map((shape) =>
//         shape.vertices.map((vertex) => ({ lat: vertex.lat, lng: vertex.lng }))
//     );
// };

// const convertFromPolygonShapes = (shapes) => {
//     if (!shapes) return [];
//     return shapes.map((shape) => ({
//         vertices: shape.map((vertex) => ({ lat: vertex.lat, lng: vertex.lng })),
//     }));
// };

const Map = ({ pub }) => {
    const { t } = useTranslation();
    const isGoogleMapsApiLoaded = useSelector(googleMapSelectIsLoaded);

    const shippingFromState = useSelector(selectShipping);
    const defaultCenter = {
        lat: 47.00556,
        lng: 28.8575,
    };

    const [center, setCenter] = useState(defaultCenter);

    const markerPosition = useMemo(
        () => (pub?.lat && pub?.lng ? { lat: pub.lat, lng: pub.lng } : null),
        [pub.lat, pub.lng]
    );
    // Set center on marker position change
    useEffect(() => {
        if (markerPosition) setCenter(markerPosition);
    }, [markerPosition]);

    //
    // Delivery area stuff
    //
    const [shapes, setShapes] = useState([]);
    const [shapesChanged, setShapesChanged] = useState(false);

    // detect changing shapes
    useEffect(() => {
        if (
            JSON.stringify(shapes) ===
            JSON.stringify(shippingFromState.shapes)
        ) {
            setShapesChanged(false);
            return;
        }

        setShapesChanged(true);
    }, [shapes, shippingFromState.shapes]);

    // upload shapes from state
    useEffect(() => {
        if (shippingFromState.shapes) {
            let shapesJSON = JSON.stringify(shippingFromState.shapes)

            setShapes(JSON.parse(shapesJSON));
        }
    }, [shippingFromState]);

    const [isDeletingPolygon, setIsDeletingPolygon] = useState(false);

    const onMouseUp = (e, shapeID) => {
        if (isDeletingPolygon) {
            setShapes((prev) => 
                prev.filter((shape, i) => shape.shape_id !== shapeID)
            );
            setIsDeletingPolygon(false);
            return;
        }

        if (polygonResizeVertex) {
            let resizedShape = shapes.find(shape => shape.shape_id === polygonResizeVertex.shapeID)

            if (!resizedShape) return;

            resizedShape.vertices[polygonResizeVertex.vertex] = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };

            let newShapes = [...shapes]
            let index = newShapes.findIndex(shape => shape.shape_id === polygonResizeVertex.shapeID);
            if(index === -1) return;

            newShapes[index] = resizedShape;

            setShapes(newShapes);

            setPolygonResizeVertex(null);
        }

        if (polygonResizeNewVertex) {
            let resizedShape = shapes.find(shape => shape.shape_id === polygonResizeNewVertex.shapeID)

            if (!resizedShape) return;

            let newLat =
                e.latLng.lat() * 2 -
                resizedShape.vertices[polygonResizeNewVertex.newVertexID - 1].lat;
            let newLng =
                e.latLng.lng() * 2 -
                resizedShape.vertices[polygonResizeNewVertex.newVertexID - 1].lng;

            resizedShape.vertices.splice(polygonResizeNewVertex.newVertexID, 0, {
                lat: newLat,
                lng: newLng,
            });

            let newShapes = [...shapes]
            let index = newShapes.findIndex(shape => shape.shape_id === polygonResizeNewVertex.shapeID);
            if(index === -1) return;

            newShapes[index] = resizedShape;

            setShapes(newShapes);

            setPolygonResizeNewVertex(null);
        }
    };

    const polygonOptions = {
        fillOpacity: 0.5,
        fillColor: "#ff0000",
        strokeColor: "#ff0000",
        strokeWeight: 2,
        editable: true,
    };

    const [drawingManagerOptions, setDrawingManagerOptions] = useState({
        polygonOptions: polygonOptions,
        drawingControl: true,

        drawingControlOptions: {
            position: window.google?.maps?.ControlPosition?.TOP_CENTER,
            drawingModes: [window.google?.maps?.drawing?.OverlayType?.POLYGON],
        },
    });

    const onOverlayComplete = useCallback((event) => {
        const shapeID = uuid()
        let newShape = {
            vertices: event.overlay
                .getPath()
                .getArray()
                .map((a) => ({ lat: a.lat(), lng: a.lng() })),
            shape_id: shapeID,
            color: getNotUsedColor(shapes, shapeID)
        }
        event.overlay?.setMap(null);

        if (newShape.vertices.length < 3) return;

        if(shapes.length === 0) {
            lastShape = newShape
            setShapes((prev) => [...prev, newShape]);
            return;
        }

        //check if shape already exists
        let areShapesEqual = false;
        if(lastShape.vertices.length === newShape.vertices.length) {
            areShapesEqual = true;

            for(let i = 0; i < newShape.vertices.length; i++) {
                if(lastShape.vertices[i].lat !== newShape.vertices[i].lat || lastShape.vertices[i].lng !== newShape.vertices[i].lng) {
                    areShapesEqual = false;
                    break;
                }
            }
        }

        if(areShapesEqual) {
            return;
        }

        //add Shape
        lastShape = newShape
        setShapes((prev) => [...prev, newShape]);
    }, [shapes]);

    const [setShipping] = useSetShippingMutation();

    const saveShapes = () => {
        setShipping({
            shapes: shapes.map(shape => ({vertices: shape.vertices, shape_id: shape.shape_id, color: shape.color})),
            pubID: pub.id,
            companyID: pub.company_id,
        });
    };

    const [polygonResizeVertex, setPolygonResizeVertex] = useState(null);
    const [polygonResizeNewVertex, setPolygonResizeNewVertex] = useState(null);
    const polygonOnMouseDown = (e, shapeID) => {
        if (e.vertex === undefined && e.edge === undefined) return;

        if (e.edge !== undefined) {
            setPolygonResizeNewVertex({ shapeID, newVertexID: e.edge + 1 });
        }
        if (e.vertex !== undefined) {
            setPolygonResizeVertex({ shapeID, vertex: e.vertex });
        }
    };

    return isGoogleMapsApiLoaded ? (
        <>
            {/* Headline */}
            <h1 className="text-bold text-center text-lg font-medium mb-4">
                <span className="block">
                    {t("admin.admin_panel.shipping.shipping_map.headline")}
                </span>
            </h1>

            {/* Map */}
            <div
                className="rounded-3xl overflow-hidden m-auto shadow-2xl border border-gray-200"
                style={{ position: "relative", maxWidth: "800px" }}
            >
                {!markerPosition ? (
                    <div
                        className="flex flex-col gap-10 justify-center items-center font-bold px-10"
                        style={{ height: "450px" }}
                    >
                        <span>
                            {t(
                                "admin.admin_panel.shipping.shipping_map.not_selected_geolocation_warning"
                            )}
                        </span>
                        <Link
                            className="text-blue-500 font-medium"
                            to={
                                pub?.id
                                    ? `/admin/pub/${pub?.id}`
                                    : "/admin/company"
                            }
                        >
                            {t(
                                "admin.admin_panel.shipping.shipping_map.go_to_admin_panel"
                            )}
                        </Link>
                    </div>
                ) : (
                    <GoogleMap
                        zoom={markerPosition ? 10 : 7}
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
                        {shapes.map((shape, index) => (
                            <PolygonF
                                draggable={false}
                                key={shape.shape_id}
                                path={shape.vertices}
                                options={{
                                    ...polygonOptions,
                                    fillColor: shape.color || "#fff",
                                    strokeColor: shape.color || "#fff",
                                    strokeOpacity: 1,
                                    zIndex: 100 - index,
                                }}
                                onMouseUp={(e) => onMouseUp(e, shape.shape_id)}
                                onMouseDown={(e) => polygonOnMouseDown(e, shape.shape_id)}

                            />
                        ))}

                        {/* DRAWING MANAGER */}
                        <DrawingManagerF
                            onOverlayComplete={onOverlayComplete}
                            options={drawingManagerOptions}
                        />
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
                    {t(
                        "admin.admin_panel.shipping.shipping_map.buttons.select_and_delete_area"
                    )}
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
                        {t("admin.admin_panel.shipping.shipping_map.buttons.save_all")}
                    </Button>
                )}
            </div>
        </>
    ) : (
        <BlackSpinner />
    );
};

export default Map;
