"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { getBrowserGeolocation } from "../../utils/browserGeolocation";
import "leaflet/dist/leaflet.css";

const ACCENT = "#2D7DD2";

// Tracks the map's own center as it's panned - the pin is a plain CSS
// overlay fixed at the container's center (not a real Leaflet marker,
// sidestepping Leaflet's well-known broken-default-icon-under-a-bundler
// issue entirely), so "confirm" always means exactly "wherever the pin is
// visually sitting". Same drag-the-map-not-the-pin interaction the mobile
// app's own location picker (SelectGeolocation.jsx) already uses.
const CenterTracker = ({ onMove }) => {
  const map = useMapEvents({
    move: () => {
      const c = map.getCenter();
      onMove({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
};

// Imperatively recenters the map when "locate me" resolves - a plain prop
// change can't move a Leaflet map itself, it has to go through the map
// instance.
const FlyToOnChange = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], Math.max(map.getZoom(), 16));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return null;
};

const MapPointPicker = ({ initialCenter, onConfirm }) => {
  const [center, setCenter] = useState(initialCenter);
  const [flyTarget, setFlyTarget] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // A successful locate-me is itself the confirmation - the client already
  // consented by granting the permission prompt, no need to also make them
  // press the button below for a point they didn't drag by hand.
  const handleLocateMe = async () => {
    setIsLocating(true);
    const coords = await getBrowserGeolocation();
    setIsLocating(false);
    if (!coords) return;

    const point = { lat: coords.lat, lng: coords.lng };
    setFlyTarget(point);
    setCenter(point);
    onConfirm(point);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ position: "relative", height: 260, borderRadius: 14, overflow: "hidden", border: "1px solid #e2e6ea" }}>
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CenterTracker onMove={setCenter} />
          <FlyToOnChange target={flyTarget} />
        </MapContainer>

        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: 1000 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill={ACCENT} stroke="#fff" strokeWidth="1.5">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="#fff" />
          </svg>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          aria-label="Определить моё местоположение"
          style={{
            position: "absolute", right: 10, bottom: 10, zIndex: 1000,
            width: 36, height: 36, borderRadius: "50%",
            background: "#fff", border: "1px solid #e2e6ea",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isLocating ? "default" : "pointer",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onConfirm(center)}
        style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
      >
        Определить адрес по этой точке
      </button>
    </div>
  );
};

export default MapPointPicker;
