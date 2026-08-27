"use client"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { pubs_api } from "../api/pubsApi";

const MAX_PUBS = 4;
const MAX_DISHES = 8;

// Pulls a handful of dishes from a few nearby pubs so a client can jump
// straight into ordering something popular without browsing pub by pub.
// No dedicated "top dishes" endpoint exists - this fetches each pub's own
// info (same client-facing endpoint the pub page itself uses) and just takes
// their first couple of visible dishes; a real "popularity"/sales-count
// signal would need a backend endpoint (see the changes note for this work).
const fetchPubDishes = async (pub) => {
  try {
    const resp = await fetch(`/api/client/pub/${pub.url_name}`)
    const data = await resp.json()
    if (!data?.ok || !data?.dishes) return []

    return data.dishes
      .filter((d) => d.visible)
      .slice(0, 2)
      .map((d) => ({
        name: d.name,
        price: d.sale_price && d.sale_price < d.price ? d.sale_price : d.price,
        image_file_name: d.image_file_name,
        pubName: pub.name,
        pubUrlName: pub.url_name,
      }))
  } catch (e) {
    console.log("fetchPubDishes failed for ", pub?.url_name, e)
    return []
  }
}

const Bestsellers = () => {
  const { i18n } = useTranslation()
  const [dishes, setDishes] = useState(null)

  useEffect(() => {
    let isActual = true

    ;(async function () {
      // A fixed, well-known point (Ceadir-Lunga center) is enough here - this
      // row is a "popular right now" shortcut, not a personalized nearby
      // list, so it doesn't need to wait on the client's own geolocation.
      const resp = await pubs_api.getAvailablePubsForLocation({ lat: 46.06098910418434, lng: 28.81794290657357 })
      if (!isActual || !resp.ok || !resp.pubs) return

      const pubs = resp.pubs.slice(0, MAX_PUBS)
      const perPub = await Promise.all(pubs.map(fetchPubDishes))
      if (!isActual) return

      setDishes(perPub.flat().slice(0, MAX_DISHES))
    })()

    return () => { isActual = false }
  }, [])

  if (dishes && dishes.length === 0) return null

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e7ebef" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 32px 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#2D7DD2" stroke="#2D7DD2" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1c2733" }}>Хиты продаж</span>
          </div>
        </div>

        {!dishes && (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: "0 0 168px", height: 112, borderRadius: 14, background: "#f1f3f5" }} />
            ))}
          </div>
        )}

        {!!dishes?.length && (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
            {dishes.map((item, i) => (
              <a
                key={i}
                href={`/${i18n.language ?? "ru"}/pub/${item.pubUrlName}`}
                style={{ flex: "0 0 168px", display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 112,
                    borderRadius: 14,
                    background: item.image_file_name
                      ? `url(/api-static/images/dishes/${item.image_file_name}) center/cover`
                      : "#123527",
                  }}
                >
                  <span
                    style={{
                      position: "absolute", right: 8, bottom: 8, width: 30, height: 30, borderRadius: "50%",
                      background: "#2D7DD2", border: "2px solid #fff", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 10px -2px rgba(0,0,0,0.35)",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1c2733", lineHeight: 1.3 }}>{item.name}</span>
                  <span style={{ fontSize: 11.5, color: "#94a3b0" }}>{item.pubName}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1E6FBF", marginTop: 2 }}>{Math.floor(item.price)}&nbsp;лей</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bestsellers;
