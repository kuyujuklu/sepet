"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { reverseGeocode } from "../../utils/reverseGeocode";

// Leaflet touches window/document at import time - can never run during SSR
// or the initial hydration pass, hence the dynamic ssr:false import instead
// of a plain one.
const MapPointPicker = dynamic(() => import("./MapPointPicker"), {
  ssr: false,
  loading: () => <div style={{ height: 260, borderRadius: 14, background: "#f1f3f5" }} />,
});

const ACCENT = "#2D7DD2";

// One way to set an address: the map, always visible, is the only source of
// truth for the point - the town/street fields underneath it are always the
// reverse-geocoded label for wherever the pin currently sits, editable by
// hand for a correction (a wrong street name, a house number Nominatim
// missed) without needing to touch the map again. There used to also be a
// pick-a-city-from-a-list fallback with its own, coordinate-less notion of
// "address" - removed outright per the client's call: every address this
// app handles now carries a precise coordinate, not just a display string.
//
// Seeded once at mount via initialTown/initialStreet/initialCoords (plain
// useState, no re-sync effect) - callers that keep their popup wrapper
// always mounted (CSS-driven open/close, e.g. the shared Popup component)
// need to force a remount on open with a `key` that changes when `opened`
// does, or this will keep showing whatever was set last time instead of the
// current saved value.
const LocationPickerFields = ({
  initialTown = "",
  initialStreet = "",
  initialCoords = null,
  mapDefaultCenter,
  onSave,
}) => {
  const { i18n } = useTranslation();
  const [town, setTown] = useState(initialTown);
  const [street, setStreet] = useState(initialStreet);
  const [coords, setCoords] = useState(initialCoords);
  const [isResolving, setIsResolving] = useState(false);

  // No confirmed label yet - either nothing was known at all (fresh
  // visitor, geolocation denied, no earlier pick: resolve the map's default
  // center) or a coordinate exists but was never actually confirmed through
  // this picker (silent background geolocation only: resolve that real
  // point instead of the generic fallback). Either way, resolve it right
  // away instead of leaving the panel sitting there with a pin but empty
  // fields until the client happens to touch the map themselves.
  useEffect(() => {
    if (initialTown) return;

    const pointToResolve = initialCoords ?? mapDefaultCenter;
    let isActual = true;
    setIsResolving(true);
    reverseGeocode(pointToResolve, i18n.language).then((address) => {
      if (!isActual) return;
      setIsResolving(false);
      setCoords(pointToResolve);
      setTown(address?.town ?? "");
      setStreet(address?.fullAddress ?? "");
    });
    return () => {
      isActual = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointConfirmed = async (point) => {
    setCoords(point);
    setIsResolving(true);
    const address = await reverseGeocode(point, i18n.language);
    setIsResolving(false);
    setTown(address?.town ?? "");
    setStreet(address?.fullAddress ?? "");
  };

  const handleSave = () => {
    if (!town.trim() || !coords) return;
    onSave({ town: town.trim(), street: street.trim(), coords });
  };

  const canSave = !!town.trim() && !!coords;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#526070" }}>Укажите точку на карте</span>
        <MapPointPicker
          initialCenter={coords ?? mapDefaultCenter}
          onConfirm={handlePointConfirmed}
        />
        {isResolving && (
          <span style={{ fontSize: 12, color: "#94a3b0" }}>Определяем адрес…</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={town}
          onChange={(e) => setTown(e.target.value)}
          placeholder="Город / населённый пункт"
          style={{ border: "1px solid #e2e6ea", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "#1c2733" }}
        />
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Улица, дом"
          style={{ border: "1px solid #e2e6ea", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "#1c2733" }}
        />
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            background: canSave ? ACCENT : "#cbd5e0",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 600,
            cursor: canSave ? "pointer" : "default",
          }}
        >
          Сохранить адрес
        </button>
      </div>
    </div>
  );
};

export default LocationPickerFields;
