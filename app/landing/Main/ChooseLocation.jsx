"use client"
import { useEffect, useRef, useState } from 'react';
import LocationPickerFields from '@/app/shared-components/LocationPicker/LocationPickerFields';

// The confirmed address label - always set together with a precise
// coordinate through the map picker (LocationPickerFields), reverse-
// geocoded then correctable by hand. Not set yet whenever geoCoords exists
// only from silent background geolocation the client hasn't reviewed -
// same key the basket side reads/writes, so a correction made on either
// side is visible to the other.
const readManualAddress = () => {
  try {
    return JSON.parse(localStorage.getItem("manualAddress")) ?? null
  } catch (e) {
    return null
  }
}

const ChooseLocation = ({ geoCoords, isDetecting, setMapPoint, mapDefaultCenter }) => {
  const [manualAddress, setManualAddress] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    setManualAddress(readManualAddress())
  }, [])

  // Close on an outside click
  useEffect(() => {
    if (!isEditorOpen) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsEditorOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [isEditorOpen])

  const isUnknown = !isDetecting && !geoCoords && !manualAddress

  // A coordinate that exists only from silent background geolocation, never
  // actually reviewed/confirmed through the picker - the delivery price
  // shown for nearby pubs is only ever as accurate as that raw coordinate,
  // so both stay labeled "примерно" until the client opens the picker (the
  // map auto-resolves the same point on open, so opening it is itself
  // basically the confirmation).
  const isApproximate = !!geoCoords && !manualAddress?.town && !isDetecting

  const displayLabel = manualAddress?.town
    ? [manualAddress.town, manualAddress.street].filter(Boolean).join(", ")
    : isDetecting
      ? "Определяем адрес…"
      : geoCoords
        ? "Ваше местоположение"
        : "Выберите адрес доставки"

  const captionLabel = manualAddress?.town
    ? "Доставляем на адрес"
    : geoCoords
      ? "Уточните адрес"
      : isUnknown
        ? "Адрес не указан"
        : "Укажите адрес"

  const openEditor = () => setIsEditorOpen(true)

  // Prefill values for the editor, so correcting is a small edit, not
  // typing an address from nothing - recomputed every render, but only
  // ever read once, at the moment LocationPickerFields mounts (it takes
  // these as its initial state, not as controlled props).
  const seedTown = manualAddress?.town ?? ""
  const seedStreet = manualAddress?.street ?? ""
  const seedCoords = geoCoords ?? null

  const handleSaveAddress = ({ town, street, coords }) => {
    const next = { town, street }
    try {
      localStorage.setItem("manualAddress", JSON.stringify(next))
    } catch (e) {
      console.log("err writing manualAddress to loc stor: ", e)
    }
    setManualAddress(next)
    setMapPoint(coords)
    setIsEditorOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", zIndex: 200 }}>
      <button
        onClick={openEditor}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#fff",
          border: isUnknown ? "1.5px solid #2D7DD2" : "1px solid #e7ebef",
          borderRadius: 16,
          padding: "13px 14px",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: isUnknown ? "#2D7DD2" : "#e8f1fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={isUnknown ? "#fff" : "#1E6FBF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 11.5, color: "#94a3b0", fontWeight: 500 }}>{captionLabel}</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isUnknown ? "#1E6FBF" : "#1c2733",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayLabel}
          </span>
        </div>
        <svg style={{ flexShrink: 0 }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a7b2bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {isApproximate && (
        <div style={{ fontSize: 11.5, color: "#94a3b0", marginTop: 6, paddingLeft: 2, lineHeight: 1.4 }}>
          Адрес и цены доставки — примерные.{" "}
          <button
            onClick={openEditor}
            style={{ color: "#1E6FBF", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
          >
            Уточнить точный адрес
          </button>
        </div>
      )}

      {isEditorOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e7ebef",
            borderRadius: 16,
            boxShadow: "0 20px 44px -16px rgba(28,39,51,0.3)",
            padding: 16,
          }}
        >
          <LocationPickerFields
            key={String(isEditorOpen)}
            initialTown={seedTown}
            initialStreet={seedStreet}
            initialCoords={seedCoords}
            mapDefaultCenter={mapDefaultCenter}
            onSave={handleSaveAddress}
          />
        </div>
      )}
    </div>
  );
};

export default ChooseLocation;
