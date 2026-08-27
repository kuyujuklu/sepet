"use client"
import { useTranslation } from 'react-i18next';
import { select_location_options_ru } from '../../static-data/data';
import { translateLocation } from '../../utils/location';
import { reverseGeocode } from '../../utils/reverseGeocode';
import { useEffect, useRef, useState } from 'react';

// A free-text correction on top of the auto-detected/picked location - e.g.
// geolocation + reverse geocoding landed 200m off in a sparsely-mapped town,
// and the client wants to type the real street/house themselves without
// losing the city. Purely a display/label override for now: it does not
// change the coordinates used for nearby-pub search or delivery pricing
// (that would need forward geocoding, not built yet) - same split mobile's
// checkout already uses (real coords for zone pricing, a separately-typed
// address for what the courier reads).
const readManualAddress = () => {
  try {
    return JSON.parse(localStorage.getItem("manualAddress")) ?? null
  } catch (e) {
    return null
  }
}

const ChooseLocation = ({ location, geoCoords, isDetecting, setLocation }) => {
  const { i18n } = useTranslation()

  const [resolvedAddress, setResolvedAddress] = useState(null)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [manualAddress, setManualAddress] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editTown, setEditTown] = useState("")
  const [editStreet, setEditStreet] = useState("")
  const wrapRef = useRef(null)

  useEffect(() => {
    setManualAddress(readManualAddress())
  }, [])

  useEffect(() => {
    if (!geoCoords) {
      setResolvedAddress(null)
      return
    }

    let isActual = true
    setIsResolvingAddress(true)

    reverseGeocode(geoCoords).then((address) => {
      if (!isActual) return
      setResolvedAddress(address)
      setIsResolvingAddress(false)
    })

    return () => {
      isActual = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoCoords?.lat, geoCoords?.lng])

  // Close on an outside click
  useEffect(() => {
    if (!isEditorOpen) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsEditorOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [isEditorOpen])

  const isUnknown = !isDetecting && !geoCoords && !location && !manualAddress

  const hasStreet = !!resolvedAddress?.fullAddress

  const displayLabel = manualAddress?.town
    ? [manualAddress.town, manualAddress.street].filter(Boolean).join(", ")
    : isDetecting
      ? "Определяем адрес…"
      : isUnknown
        ? "Выберите город доставки"
        : geoCoords
          ? (isResolvingAddress
            ? "Определяем адрес…"
            : resolvedAddress?.town
              ? (hasStreet ? [resolvedAddress.town, resolvedAddress.fullAddress].join(", ") : `Примерно: ${resolvedAddress.town}`)
              : "Ваше местоположение")
          : location
            ? translateLocation(location, i18n.language)
            : "Выберите город доставки"

  const captionLabel = manualAddress?.town
    ? "Доставляем на адрес"
    : geoCoords && hasStreet
      ? "Доставляем на адрес"
      : geoCoords
        ? "Ближайший город"
        : isUnknown
          ? "Адрес не указан"
          : "Доставляем в город"

  const openEditor = () => {
    // Prefill with whatever we already know, so correcting is a small edit,
    // not typing an address from nothing
    const seedTown = manualAddress?.town
      ?? resolvedAddress?.town
      ?? (location ? translateLocation(location, i18n.language) : "")
    const seedStreet = manualAddress?.street ?? resolvedAddress?.fullAddress ?? ""

    setEditTown(seedTown)
    setEditStreet(seedStreet)
    setIsEditorOpen(true)
  }

  const saveManualAddress = () => {
    const next = { town: editTown.trim(), street: editStreet.trim() }
    if (!next.town) return

    try {
      localStorage.setItem("manualAddress", JSON.stringify(next))
    } catch (e) {
      console.log("err writing manualAddress to loc stor: ", e)
    }

    setManualAddress(next)
    setIsEditorOpen(false)
  }

  const pickCityFromList = (cityId) => {
    try {
      localStorage.removeItem("manualAddress")
    } catch (e) { /* noop */ }

    setManualAddress(null)
    setLocation(cityId)
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
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#526070" }}>Уточните адрес доставки</span>
            <input
              value={editTown}
              onChange={(e) => setEditTown(e.target.value)}
              placeholder="Город / населённый пункт"
              style={{ border: "1px solid #e2e6ea", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "#1c2733" }}
            />
            <input
              value={editStreet}
              onChange={(e) => setEditStreet(e.target.value)}
              placeholder="Улица, дом"
              style={{ border: "1px solid #e2e6ea", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "#1c2733" }}
            />
            <button
              onClick={saveManualAddress}
              disabled={!editTown.trim()}
              style={{
                background: editTown.trim() ? "#2D7DD2" : "#cbd5e0",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 600,
                cursor: editTown.trim() ? "pointer" : "default",
              }}
            >
              Сохранить адрес
            </button>
          </div>

          <div style={{ borderTop: "1px solid #f1f3f5", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#94a3b0" }}>Или выберите город из списка</span>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {select_location_options_ru.map((opt, idx) => (
                <button
                  key={`${opt.value}-${idx}`}
                  onClick={() => pickCityFromList(opt.value)}
                  style={{
                    textAlign: "left",
                    padding: "8px 6px",
                    fontSize: 13.5,
                    color: "#1c2733",
                    background: opt.value === location ? "#eaf2fb" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseLocation;
