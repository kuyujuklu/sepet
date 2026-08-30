"use client"
import { useState, useEffect, useMemo } from "react";
import { pubs_api } from "../api/pubsApi";
import PubCard from "./PubCard";
import BlackSpinner from "../../shared-components/loaders/BlackSpinner";
import { getPubWorkHours } from "../../utils/pub";
import { pubMatchesSection } from "../../utils/sections";

const filterIds = {
  all: "all",
  open: "open",
  freeDelivery: "free_delivery",
};

const filterOptions = [
  { id: filterIds.all, label: "Все заведения" },
  { id: filterIds.open, label: "Открыто сейчас" },
  { id: filterIds.freeDelivery, label: "Бесплатная доставка" },
];

const sortOptions = [
  { id: "rating", label: "По рейтингу" },
  { id: "distance", label: "По расстоянию" },
  { id: "speed", label: "По скорости доставки" },
];

const PubList = ({ locationLatLng, activeSection }) => {
  const [pubs, setPubs] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState(filterIds.all)
  const [sortBy, setSortBy] = useState("rating")
  const [isSortOpen, setIsSortOpen] = useState(false)

  useEffect(() => {
    if (!locationLatLng?.lat || !locationLatLng?.lng) return

    (async function () {
      setIsLoading(true);
      const resp = await pubs_api.getAvailablePubsForLocation({ lat: locationLatLng.lat, lng: locationLatLng.lng });
      setIsLoading(false)
      if (!resp.ok || !resp.pubs) return
      setPubs(resp.pubs);
    })();
  }, [locationLatLng, setPubs]);

  const visiblePubs = useMemo(() => {
    if (!pubs) return []

    let result = pubs.filter((pub) => pubMatchesSection(pub, activeSection))

    if (activeFilter === filterIds.open) {
      result = result.filter((pub) => getPubWorkHours(pub).isDeliveryAvailable)
    }
    if (activeFilter === filterIds.freeDelivery) {
      result = result.filter((pub) => +pub?.shipping_free_delivery_price > 0)
    }

    const compare = {
      rating: (a, b) => (+b?.rating || 0) - (+a?.rating || 0),
      distance: (a, b) => (a?.distance ?? Infinity) - (b?.distance ?? Infinity),
      speed: (a, b) => (a?.shipping?.shipping_time_to ?? Infinity) - (b?.shipping?.shipping_time_to ?? Infinity),
    }[sortBy]

    return result
      .slice()
      .sort(compare)
      // Open pubs first regardless of sort choice - a closed pub matching the
      // sort best is still not orderable right now
      .sort((a, b) => {
        const aOpen = getPubWorkHours(a).isDeliveryAvailable
        const bOpen = getPubWorkHours(b).isDeliveryAvailable
        return aOpen === bOpen ? 0 : aOpen ? -1 : 1
      })
  }, [pubs, activeSection, activeFilter, sortBy])

  return (
    <div className="w-full flex flex-col" style={{ gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {filterOptions.map((f) => {
            const on = f.id === activeFilter
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  borderRadius: 999,
                  padding: "8px 15px",
                  fontSize: 13,
                  fontWeight: on ? 600 : 500,
                  border: on ? "1px solid #2D7DD2" : "1px solid #e2e6ea",
                  background: on ? "#2D7DD21f" : "#fff",
                  color: on ? "#1E6FBF" : "#526070",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsSortOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e7ebef", borderRadius: 12, padding: "9px 14px", fontSize: 13.5, fontWeight: 500, color: "#44403c", cursor: "pointer" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#78838d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" /><path d="m3 17 3 3 3-3" /><path d="M6 18V4" /></svg>
            Сортировать: {sortOptions.find((s) => s.id === sortBy)?.label}
          </button>
          {isSortOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #e7ebef", borderRadius: 12, boxShadow: "0 12px 28px -12px rgba(28,39,51,0.25)", overflow: "hidden", zIndex: 10, minWidth: 220 }}>
              {sortOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSortBy(s.id); setIsSortOpen(false) }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13.5, fontWeight: s.id === sortBy ? 600 : 400, background: s.id === sortBy ? "#eaf2fb" : "#fff", color: "#1c2733", border: "none", cursor: "pointer" }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!locationLatLng?.lat && (
        <div className="text-center" style={{ color: "#78838d", fontSize: 15, padding: "24px 0" }}>
          Укажите адрес доставки выше, чтобы увидеть заведения рядом с вами
        </div>
      )}

      {!!locationLatLng?.lat && isLoading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><BlackSpinner /></div>}

      {!!locationLatLng?.lat && !isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {visiblePubs.map((pub) => <PubCard key={pub.url_name} pub={pub} />)}
        </div>
      )}

      {!!(locationLatLng?.lat && locationLatLng?.lng && !isLoading && pubs && visiblePubs.length === 0) && (
        <div className="text-center" style={{ color: "#78838d", fontSize: 15, padding: "24px 0" }}>
          {pubs.length === 0 ? "Мы пока сюда не доставляем :(" : "В этом разделе пока нет заведений рядом с вами"}
        </div>
      )}
    </div>
  );
};

export default PubList;
