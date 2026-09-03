import BlackSpinner from "@/components/loaders/BlackSpinner";
import { Button } from "@mui/material";
import {
    GoogleMap,
    Marker,
    Polygon,
    PolygonF,
} from "@react-google-maps/api";
import { v4 as uuid } from "uuid";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectShipping } from "./shippingSlice";
import { useSetShippingMutation, useSetGeolocationMutation } from "@/api/pub/pub";
import { googleMapSelectIsLoaded } from "../../../GoogleMapsLoader/googleMapsSlice";
import { useTranslation } from "react-i18next";
import uniqolor from "uniqolor";

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

const buttonSx = (bgcolor, hoverBgcolor) => ({
    color: "white",
    bgcolor,
    fontSize: ".7rem",
    fontWeight: "medium",
    padding: ".7rem 1rem",
    borderRadius: "10px",
    width: "fit-content%",
    margin: "15px 0 0  0",
    ":hover": {
        bgcolor: hoverBgcolor,
    },
});

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

// Zones are drawn as overlapping semi-transparent fills, so wherever two
// zones' areas overlap the colors used to blend together and it was unclear
// which zone actually applied there. The decorative fill layer below cuts
// every higher-priority zone's shape out of each zone as a hole, so only
// the topmost (per the existing zIndex priority) zone's color ever shows at
// an overlap - Google Maps only treats a second path as a hole when it
// winds the opposite direction from the outer path, and hand-drawn shapes
// can end up wound either way depending on click order, so the hole ring is
// normalized to always oppose the outer ring's winding.
const ringSignedArea = (vertices) => {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b = vertices[(i + 1) % vertices.length];
        area += a.lat * b.lng - b.lat * a.lng;
    }
    return area / 2;
};

const asHoleRing = (holeVertices, outerVertices) => {
    const sameWinding =
        Math.sign(ringSignedArea(holeVertices)) ===
        Math.sign(ringSignedArea(outerVertices));
    return sameWinding ? reverseArr(holeVertices) : holeVertices;
};

// Plain average of the vertices. For a one-off convex shape this lands near
// its visual middle, but delivery zones here are typically concentric rings
// drawn around the same pub - and a ring of points surrounding a shared
// center averages to roughly that SAME center no matter how big the ring
// is, which is exactly why every zone's label used to land in one pile in
// the middle. Only used as a last-resort fallback below.
const polygonCentroid = (vertices) => {
    const sum = vertices.reduce(
        (acc, v) => ({ lat: acc.lat + v.lat, lng: acc.lng + v.lng }),
        { lat: 0, lng: 0 }
    );
    return { lat: sum.lat / vertices.length, lng: sum.lng / vertices.length };
};

// Flat (equirectangular) projection around `center`, just for placing a
// label a plausible distance/direction away - not real-world accurate, but
// consistent between project/unproject so the round trip is correct, and
// good enough at the city scale these zones are drawn at.
const projectFlat = (point, center) => {
    const latScale = Math.cos((center.lat * Math.PI) / 180) || 1;
    return { x: (point.lng - center.lng) * latScale, y: point.lat - center.lat };
};

const unprojectFlat = (point, center) => {
    const latScale = Math.cos((center.lat * Math.PI) / 180) || 1;
    return { lat: center.lat + point.y, lng: center.lng + point.x / latScale };
};

const averageRadiusFromCenter = (vertices, center) => {
    const radii = vertices.map((v) => {
        const p = projectFlat(v, center);
        return Math.hypot(p.x, p.y);
    });
    return radii.reduce((a, b) => a + b, 0) / radii.length;
};

const pointOnRing = (center, radius, bearingDeg) => {
    const rad = (bearingDeg * Math.PI) / 180;
    return unprojectFlat(
        { x: radius * Math.sin(rad), y: radius * Math.cos(rad) },
        center
    );
};

const isPointInPolygon = (point, vertices) => {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].lng, yi = vertices[i].lat;
        const xj = vertices[j].lng, yj = vertices[j].lat;
        const intersects =
            yi > point.lat !== yj > point.lat &&
            point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
    }
    return inside;
};

// Places a zone's label on the ring at that zone's own average distance
// from the shared center, trying several directions until one actually
// lands inside the zone's own exclusive (non-overlapped) area - this is
// what correctly spreads concentric zones' labels apart by radius instead
// of collapsing them all toward the shared center.
const findZoneLabelPosition = (shape, higherPriorityShapes, center) => {
    const radius = averageRadiusFromCenter(shape.vertices, center);
    const candidateBearings = [0, 45, 90, 135, 180, 225, 270, 315];

    for (const bearing of candidateBearings) {
        const point = pointOnRing(center, radius, bearing);
        const insideOwnShape = isPointInPolygon(point, shape.vertices);
        const insideHigherPriorityShape = higherPriorityShapes.some((higher) =>
            isPointInPolygon(point, higher.vertices)
        );
        if (insideOwnShape && !insideHigherPriorityShape) return point;
    }

    return polygonCentroid(shape.vertices);
};

const TRANSPARENT_MARKER_ICON_URL =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1'%20height='1'%2F%3E";

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

const Map = ({ pub, readOnly = false }) => {
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

    // Shared reference point for spreading zone labels apart by radius (see
    // findZoneLabelPosition) - the average of every zone's vertices, which
    // approximates the common center these zones are drawn around better
    // than relying on any single zone's own (possibly off-center) shape.
    const zonesCenter = useMemo(() => {
        const allVertices = shapes.flatMap((shape) => shape.vertices);
        return allVertices.length ? polygonCentroid(allVertices) : markerPosition;
    }, [shapes, markerPosition]);

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

    //
    // Drawing a new area
    // (the "drawing" library / DrawingManager was removed from the
    // Maps JavaScript API in v3.65, so the polygon is drawn by hand)
    //
    const [isDrawing, setIsDrawing] = useState(false);
    const [draftVertices, setDraftVertices] = useState([]);
    const [draftColor, setDraftColor] = useState(colors[0]);

    const startDrawing = () => {
        setIsDeletingPolygon(false);
        setDraftColor(getNotUsedColor(shapes));
        setDraftVertices([]);
        setIsDrawing(true);
    };

    const cancelDrawing = useCallback(() => {
        setDraftVertices([]);
        setIsDrawing(false);
    }, []);

    const finishDrawing = useCallback(() => {
        if (draftVertices.length >= 3) {
            const newShape = {
                vertices: draftVertices,
                shape_id: uuid(),
                color: draftColor,
            };
            setShapes((prev) => [...prev, newShape]);
        }

        setDraftVertices([]);
        setIsDrawing(false);
    }, [draftVertices, draftColor]);

    // Once the draft has 3 vertices it encloses an area, and anything drawn on
    // top of the map (the draft polygon itself, the vertex markers, an existing
    // area) can receive the click instead of the map. So every overlay that can
    // sit under the cursor while drawing forwards its click here rather than
    // relying on the map to see it.
    const addVertex = useCallback((e) => {
        setDraftVertices((prev) => [
            ...prev,
            { lat: e.latLng.lat(), lng: e.latLng.lng() },
        ]);
    }, []);

    const onMapClick = (e) => {
        if (!isDrawing) {
            setIsDeletingPolygon(false);
            return;
        }

        addVertex(e);
    };

    const onShapeClick = (e) => {
        if (isDrawing) addVertex(e);
    };

    // Enter finishes the area, Escape discards it
    useEffect(() => {
        if (!isDrawing) return;

        const onKeyDown = (e) => {
            if (e.key === "Enter") finishDrawing();
            if (e.key === "Escape") cancelDrawing();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isDrawing, finishDrawing, cancelDrawing]);

    const [setShipping] = useSetShippingMutation();

    // Setting the pub's own location used to live on the old tile-grid main
    // page (PinPubsGeolocation.jsx, now unused) - moved here since this is
    // the only screen that actually needs it (delivery zones are drawn
    // around this point), rather than sending the admin off to a page that
    // has nothing to do with delivery.
    const [setGeolocation, { isLoading: isSettingGeolocation }] = useSetGeolocationMutation();
    const pinGeolocation = (lat, lng) => {
        if (!pub?.id) return;
        setGeolocation({ companyID: pub.company_id, pubID: pub.id, lat, lng });
    };

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
            <div className="text-[12px] font-semibold tracking-wide uppercase text-muted-2 mb-3">
                {t("admin.admin_panel.shipping.shipping_map.headline")}
            </div>

            {/* Map */}
            <div
                className="rounded-3xl overflow-hidden m-auto shadow-2xl border border-gray-200"
                style={{ position: "relative", width: "100%", maxWidth: "800px" }}
            >
                {!markerPosition ? (
                    <div style={{ position: "relative" }}>
                        <div className="text-[13px] text-muted text-center px-6 py-3 font-medium">
                            {readOnly
                                ? t("admin.admin_panel.shipping.shipping_map.not_selected_geolocation_warning")
                                : t("admin.admin_panel.shipping.shipping_map.pick_location_hint")}
                        </div>
                        {!readOnly && (
                            <GoogleMap
                                zoom={7}
                                center={center}
                                options={{
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    gestureHandling: "greedy",
                                    mapTypeControlOptions: {
                                        mapTypeIds: [window.google?.maps.MapTypeId.ROADMAP],
                                    },
                                }}
                                mapContainerStyle={{ width: "100%", height: "400px" }}
                                onDblClick={(e) =>
                                    e.latLng && pinGeolocation(e.latLng.lat(), e.latLng.lng())
                                }
                            />
                        )}
                        {isSettingGeolocation && (
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,.6)" }}
                            >
                                <BlackSpinner />
                            </div>
                        )}
                    </div>
                ) : (
                    <GoogleMap
                        zoom={markerPosition ? 10 : 7}
                        center={center}
                        onClick={readOnly ? undefined : onMapClick}
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            gestureHandling: "greedy",
                            disableDoubleClickZoom: isDrawing,
                            draggableCursor: isDrawing ? "crosshair" : undefined,
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
                        {shapes.map((shape, index) => {
                            // Every zone drawn before this one (lower index) sits
                            // above it per the zIndex below, so its area is cut
                            // out here as a hole - this zone's fill then only
                            // covers the part no higher-priority zone claims.
                            const higherPriorityShapes = shapes.slice(0, index);
                            const decorativePaths = [
                                shape.vertices,
                                ...higherPriorityShapes.map((higher) =>
                                    asHoleRing(higher.vertices, shape.vertices)
                                ),
                            ];
                            const labelPosition = zonesCenter
                                ? findZoneLabelPosition(shape, higherPriorityShapes, zonesCenter)
                                : polygonCentroid(shape.vertices);

                            return (
                                <Fragment key={shape.shape_id}>
                                    {/* Decorative fill - shows the zone's own
                                        color with overlapping higher-priority
                                        zones cut out. Not interactive, so it
                                        never intercepts clicks/drags. */}
                                    <PolygonF
                                        paths={decorativePaths}
                                        options={{
                                            ...polygonOptions,
                                            editable: false,
                                            clickable: false,
                                            fillColor: shape.color || "#fff",
                                            strokeColor: shape.color || "#fff",
                                            strokeOpacity: 1,
                                            zIndex: 50 - index,
                                        }}
                                    />
                                    {/* Interactive hit-target - same single-ring
                                        shape as before, invisible, so all the
                                        existing click/select/vertex-drag logic
                                        below is unaffected by the holes above. */}
                                    <PolygonF
                                        draggable={false}
                                        path={shape.vertices}
                                        options={{
                                            ...polygonOptions,
                                            editable: !readOnly && !isDrawing,
                                            clickable: !readOnly && !isDrawing,
                                            fillOpacity: 0.01,
                                            strokeOpacity: 0,
                                            zIndex: 100 - index,
                                        }}
                                        onClick={readOnly ? undefined : onShapeClick}
                                        onMouseUp={readOnly ? undefined : (e) => onMouseUp(e, shape.shape_id)}
                                        onMouseDown={readOnly ? undefined : (e) => polygonOnMouseDown(e, shape.shape_id)}
                                    />
                                    <Marker
                                        position={labelPosition}
                                        clickable={false}
                                        icon={{
                                            url: TRANSPARENT_MARKER_ICON_URL,
                                            scaledSize: new window.google.maps.Size(1, 1),
                                        }}
                                        label={{
                                            text: t(
                                                "admin.admin_panel.shipping.shipping_map.zone_label",
                                                { number: index + 1 }
                                            ),
                                            color: "#1f2937",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                        }}
                                        zIndex={500}
                                    />
                                </Fragment>
                            );
                        })}

                        {/* AREA BEING DRAWN */}
                        {isDrawing && draftVertices.length > 0 && (
                            <>
                                <PolygonF
                                    path={draftVertices}
                                    onClick={addVertex}
                                    options={{
                                        ...polygonOptions,
                                        editable: false,
                                        clickable: false,
                                        fillColor: draftColor,
                                        strokeColor: draftColor,
                                        strokeOpacity: 1,
                                        zIndex: 200,
                                    }}
                                />
                                {draftVertices.map((vertex, index) => (
                                    <Marker
                                        key={index}
                                        position={vertex}
                                        onClick={
                                            index === 0
                                                ? finishDrawing
                                                : addVertex
                                        }
                                        icon={{
                                            path: window.google.maps.SymbolPath
                                                .CIRCLE,
                                            scale: 5,
                                            fillColor: "#ffffff",
                                            fillOpacity: 1,
                                            strokeColor: draftColor,
                                            strokeWeight: 2,
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </GoogleMap>
                )}
            </div>

            {/* Drawing hint */}
            {isDrawing && (
                <p
                    className="text-center text-xs text-gray-500 m-auto mt-2"
                    style={{ maxWidth: "800px" }}
                >
                    {t("admin.admin_panel.shipping.shipping_map.drawing_hint")}
                </p>
            )}

            {/* Buttons */}
            {!readOnly && (
            <div className="flex flex-wrap gap-3 m-auto" style={{ maxWidth: "800px" }}>
                {isDrawing ? (
                    <>
                        <Button
                            variant="contained"
                            disabled={draftVertices.length < 3}
                            sx={buttonSx("#16a34a", "#15803d")}
                            onClick={finishDrawing}
                        >
                            {t(
                                "admin.admin_panel.shipping.shipping_map.buttons.finish_area"
                            )}
                        </Button>
                        <Button
                            variant="contained"
                            sx={buttonSx("#6b7280", "#4b5563")}
                            onClick={cancelDrawing}
                        >
                            {t(
                                "admin.admin_panel.shipping.shipping_map.buttons.cancel_drawing"
                            )}
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        sx={buttonSx("#3b82f6", "#2563eb")}
                        onClick={startDrawing}
                    >
                        {t(
                            "admin.admin_panel.shipping.shipping_map.buttons.draw_area"
                        )}
                    </Button>
                )}
                <Button
                    variant="contained"
                    disabled={isDrawing}
                    sx={buttonSx(
                        isDeletingPolygon ? "#7f1d1d" : "rgb(239 68 68)",
                        isDeletingPolygon ? "#7f1d1d" : "rgb(239 68 68)"
                    )}
                    onClick={() => {
                        setIsDeletingPolygon(!isDeletingPolygon);
                    }}
                >
                    {t(
                        "admin.admin_panel.shipping.shipping_map.buttons.select_and_delete_area"
                    )}
                </Button>
                {shapesChanged && !isDrawing && (
                    <Button
                        variant="contained"
                        sx={buttonSx("#3b82f6", "#2563eb")}
                        onClick={saveShapes}
                    >
                        {t("admin.admin_panel.shipping.shipping_map.buttons.save_all")}
                    </Button>
                )}
            </div>
            )}
        </>
    ) : (
        <BlackSpinner />
    );
};

export default Map;
