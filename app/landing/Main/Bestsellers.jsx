"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { pubs_api } from "../api/pubsApi";
import { addCommissionToPrice } from "../../utils/dish";
import { countCommissionForPub } from "../../utils/pub";

const MAX_DISHES = 8;

// The row of dishes a client can order straight from the home page.
//
// This used to fetch every nearby pub's full menu (one request per pub) and
// take the first couple of visible dishes from each, because there was no
// "popular dishes" endpoint and no popularity signal to sort by. There is
// now: `get-available-top-dishes` ranks by `is_hit` and `orders_count`
// server-side, sinks closed pubs, interleaves pubs so one menu cannot fill
// the row, filters by section, and embeds each dish's pub summary - so this
// is one request that already answers the question the row is asking.
const Bestsellers = ({ locationLatLng, activeSection }) => {
  const { i18n } = useTranslation()
  const [dishes, setDishes] = useState(null)

  useEffect(() => {
    setDishes(null)
    if (!locationLatLng?.lat || !locationLatLng?.lng) return

    let isActual = true
    ;(async function () {
      const resp = await pubs_api.getTopDishesForLocation({
        lat: locationLatLng.lat,
        lng: locationLatLng.lng,
        section: activeSection,
        limit: MAX_DISHES,
      })
      if (!isActual) return

      setDishes(resp.ok && resp.dishes ? resp.dishes : [])
    })()

    return () => { isActual = false }
  }, [locationLatLng, activeSection])

  if (!locationLatLng?.lat || !locationLatLng?.lng) return null
  if (dishes && dishes.length === 0) return null

  return (
    <div>
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
          {dishes.map((dish) => {
            const pub = dish.pub ?? {}
            const hasSale = !!dish.sale_price && dish.sale_price < dish.price
            const price = addCommissionToPrice(
              hasSale ? dish.sale_price : dish.price,
              countCommissionForPub(pub),
            )

            return (
              <a
                key={dish.id}
                href={`/${i18n.language ?? "ru"}/pub/${pub.url_name}`}
                style={{ flex: "0 0 168px", display: "flex", flexDirection: "column", gap: 8, opacity: pub.is_open === false ? 0.72 : 1 }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 112,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#123527",
                  }}
                >
                  {dish.image_file_name && (
                    <Image
                      // Generated on upload; empty when the original was
                      // already small enough to send as it is.
                      src={`/api-static/images/dishes/${dish.image_thumb_file_name || dish.image_file_name}`}
                      alt={dish.name}
                      fill
                      sizes="168px"
                      style={{ objectFit: "cover" }}
                    />
                  )}

                  {/* The badge is the pub's own flag now - it used to be
                      awarded by position in the row, which made whatever
                      happened to be fetched first a "хит". */}
                  {dish.is_hit && (
                    <span style={{ position: "absolute", top: 8, left: 8, background: "#2D7DD2", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 999 }}>
                      ХИТ
                    </span>
                  )}

                  {pub.is_open === false && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.92)", color: "#1c2733", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 999 }}>
                      ЗАКРЫТО
                    </span>
                  )}

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
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1c2733", lineHeight: 1.3 }}>{dish.name}</span>
                  <span style={{ fontSize: 11.5, color: "#94a3b0" }}>{pub.name}</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                    {hasSale && (
                      <span style={{ fontSize: 11.5, color: "#b0b8bf", textDecoration: "line-through" }}>
                        {Math.floor(addCommissionToPrice(dish.price, countCommissionForPub(pub)))}&nbsp;лей
                      </span>
                    )}
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: hasSale ? "#d24545" : "#1E6FBF" }}>
                      {Math.floor(price)}&nbsp;лей
                    </span>
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default Bestsellers;
