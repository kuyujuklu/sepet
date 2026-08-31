"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { pubs_api } from "../api/pubsApi";
import { countCommissionForPub, getPubWorkHours } from "../../utils/pub";
import { addCommissionToPrice } from "../../utils/dish";
import { currencies } from "../../static-data/data";
import ConfirmPopup from "../../shared-components/Popup/ConfirmPopup";
import Toast from "../../shared-components/Popup/Toast";
import DishPhotoLightbox from "../../[locale]/pub/components/PubPage/Dishes/DishPhotoLightbox";
import { readLocalBasket, writeLocalBasket } from "../../utils/localBasket";
import { trackEcommerceEvent } from "../../utils/analytics";

const CLOSED_TOAST_MESSAGE = "Сейчас закрыто, но вы можете собрать корзину — оформим, как только заведение откроется.";
const CLOSED_TOAST_DURATION = 3500;

const MAX_DISHES = 8;
const ACCENT = "#2D7DD2";

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
  // {[pub.url_name]: pub.shipping} - the aggregated feed only sends a
  // precomputed is_open, which has been wrong often enough (a full-day-off
  // schedule entry isn't handled right server-side) to not be trusted as
  // the only source. The pub page and basket compute this themselves from
  // the real weekly schedule instead; this fetches that same schedule for
  // whatever pubs are in the row so the row can do the same live
  // computation rather than defer to the feed's own verdict.
  const [pubSchedules, setPubSchedules] = useState({})
  const [localCounts, setLocalCounts] = useState({})
  const [pendingAdd, setPendingAdd] = useState(null)
  const [pendingRemove, setPendingRemove] = useState(null)
  const [openPhotoItem, setOpenPhotoItem] = useState(null)
  const [loadedImages, setLoadedImages] = useState({})
  const [isClosedToastVisible, setIsClosedToastVisible] = useState(false)
  const closedToastTimerRef = useRef(null)

  useEffect(() => {
    setLocalCounts(readLocalBasket())
  }, [])

  useEffect(() => () => clearTimeout(closedToastTimerRef.current), [])

  // Adding from a closed pub is allowed on purpose (no barrier to building
  // a cart for whenever it reopens - checkout is what actually gates on
  // isDeliveryAvailable) - this just tells the client why, instead of them
  // finding out at checkout. Re-triggering resets the timer rather than
  // stacking, so rapid clicks don't spam toasts.
  const notifyClosed = () => {
    setIsClosedToastVisible(true)
    clearTimeout(closedToastTimerRef.current)
    closedToastTimerRef.current = setTimeout(() => setIsClosedToastVisible(false), CLOSED_TOAST_DURATION)
  }

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

  // Independent of the dishes fetch above (doesn't need to redo this on a
  // section switch) - PubList already makes this exact call for the same
  // location to build its own grid, so this duplicates one request rather
  // than adding per-pub ones.
  useEffect(() => {
    setPubSchedules({})
    if (!locationLatLng?.lat || !locationLatLng?.lng) return

    let isActual = true
    ;(async function () {
      const resp = await pubs_api.getAvailablePubsForLocation({ lat: locationLatLng.lat, lng: locationLatLng.lng })
      if (!isActual || !resp.ok || !resp.pubs) return

      const schedules = {}
      resp.pubs.forEach((pub) => { schedules[pub.url_name] = pub.shipping })
      setPubSchedules(schedules)
    })()

    return () => { isActual = false }
  }, [locationLatLng])

  // Falls back to the feed's own is_open only until the real schedule for
  // this pub has loaded (or if it never resolves it - e.g. outside every
  // zone) - so the row doesn't flash every tile as closed for the brief
  // window before the schedule fetch above resolves.
  const isPubOpen = (pub) => {
    const schedule = pubSchedules[pub.url_name]
    if (!schedule) return pub.is_open !== false
    return getPubWorkHours({ shipping: schedule }).isDeliveryAvailable
  }

  // Keeps only the entries already belonging to this dish's pub, then adds
  // one - the same "switching pubID clears the rest" rule basketSlice's
  // reducers enforce, replicated here since this row can't dispatch into
  // that reducer directly. Called either straight away (no conflict) or
  // after the user confirms clearing another pub's items.
  const commitAdd = (dish) => {
    const basket = readLocalBasket()
    const next = {}
    for (const key of Object.keys(basket)) {
      if (basket[key]?.pubID === dish.pub.url_name) next[key] = basket[key]
    }
    next[dish.id] = { pubID: dish.pub.url_name, count: (next[dish.id]?.count ?? 0) + 1 }
    writeLocalBasket(next)
    setLocalCounts(next)

    const commission = countCommissionForPub(dish.pub)
    const hasSale = !!dish.sale_price && dish.sale_price < dish.price
    const price = addCommissionToPrice(hasSale ? dish.sale_price : dish.price, commission)
    trackEcommerceEvent("add_to_cart", {
      currency: currencies.find((c) => c.id === dish.pub?.currency_id)?.name ?? "MDL",
      value: price,
      items: [{ item_id: String(dish.id), item_name: dish.name, price, quantity: 1 }],
    })
  }

  const handleIncreaseClick = (dish) => {
    if (dish.available === false) return

    if (dish.pub && !isPubOpen(dish.pub)) notifyClosed()

    const basket = readLocalBasket()
    const hasOtherPubItems = Object.values(basket).some(
      (d) => d?.count > 0 && d.pubID !== dish.pub.url_name
    )
    if (hasOtherPubItems) {
      setPendingAdd(dish)
      return
    }
    commitAdd(dish)
  }

  const handleDecreaseClick = (dish) => {
    const basket = readLocalBasket()
    const current = basket[dish.id]?.count ?? 0
    if (current <= 0) return

    if (current === 1) {
      setPendingRemove(dish)
      return
    }

    const next = { ...basket, [dish.id]: { ...basket[dish.id], count: current - 1 } }
    writeLocalBasket(next)
    setLocalCounts(next)
  }

  const confirmRemove = () => {
    const basket = readLocalBasket()
    const next = { ...basket }
    delete next[pendingRemove.id]
    writeLocalBasket(next)
    setLocalCounts(next)
    setPendingRemove(null)
  }

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
            const isOpen = isPubOpen(pub)
            const isAvailable = dish.available !== false
            const commission = countCommissionForPub(pub)
            const hasSale = !!dish.sale_price && dish.sale_price < dish.price
            const smallestPrice = hasSale ? dish.sale_price : dish.price
            const displayPrice = Math.floor(addCommissionToPrice(smallestPrice, commission))
            const count = localCounts[dish.id]?.count ?? 0

            return (
              <div key={dish.id} style={{ flex: "0 0 168px", display: "flex", flexDirection: "column", gap: 8, opacity: isOpen && isAvailable ? 1 : 0.6 }}>
                <div
                  role="button"
                  tabIndex={dish.image_file_name ? 0 : -1}
                  onClick={() => dish.image_file_name && setOpenPhotoItem(dish)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && dish.image_file_name) {
                      e.preventDefault()
                      setOpenPhotoItem(dish)
                    }
                  }}
                  aria-label={dish.image_file_name ? `${dish.name} - увеличить фото` : undefined}
                  style={{
                    position: "relative",
                    height: 112,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#123527",
                    cursor: dish.image_file_name ? "zoom-in" : "default",
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
                      style={{ objectFit: "cover", opacity: loadedImages[dish.id] ? 1 : 0, transition: "opacity 320ms ease" }}
                      onLoad={() => setLoadedImages((prev) => ({ ...prev, [dish.id]: true }))}
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

                  {!isOpen && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(20,26,33,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ background: "rgba(255,255,255,0.94)", color: "#1c2733", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}>
                        Закрыто
                      </span>
                    </div>
                  )}

                  {isOpen && !isAvailable && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(20,26,33,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ background: "rgba(255,255,255,0.94)", color: "#1c2733", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}>
                        Нет в наличии
                      </span>
                    </div>
                  )}

                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute", right: 8, bottom: 8, display: "flex", alignItems: "center", gap: 5,
                      background: count > 0 ? "#fff" : "transparent",
                      borderRadius: 999,
                      padding: count > 0 ? "3px 4px" : 0,
                      boxShadow: count > 0 ? "0 4px 10px -2px rgba(0,0,0,0.35)" : "none",
                    }}
                  >
                    {count > 0 && (
                      <button
                        onClick={() => handleDecreaseClick(dish)}
                        aria-label="Убавить"
                        style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${ACCENT}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
                      </button>
                    )}
                    {count > 0 && (
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1c2733", minWidth: 8, textAlign: "center" }}>{count}</span>
                    )}
                    <button
                      onClick={() => handleIncreaseClick(dish)}
                      disabled={!isAvailable}
                      aria-label="Добавить в корзину"
                      style={{
                        width: 30, height: 30, borderRadius: "50%", border: count > 0 ? "none" : "2px solid #fff",
                        background: isAvailable ? ACCENT : "#94a3b0", display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: count > 0 ? "none" : "0 4px 10px -2px rgba(0,0,0,0.35)",
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    </button>
                  </div>
                </div>

                <a
                  href={`/${i18n.language ?? "ru"}/pub/${pub.url_name}`}
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1c2733", lineHeight: 1.3 }}>{dish.name}</span>
                  <span style={{ fontSize: 11.5, color: "#94a3b0" }}>{pub.name}</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                    {hasSale && (
                      <span style={{ fontSize: 11.5, color: "#b0b8bf", textDecoration: "line-through" }}>
                        {Math.floor(addCommissionToPrice(dish.price, commission))}&nbsp;{currencies.find((c) => c.id === pub.currency_id)?.symbol ?? "Lei"}
                      </span>
                    )}
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: hasSale ? "#d24545" : "#1E6FBF" }}>
                      {displayPrice}&nbsp;{currencies.find((c) => c.id === pub.currency_id)?.symbol ?? "Lei"}
                    </span>
                  </span>
                </a>
              </div>
            )
          })}
        </div>
      )}

      {openPhotoItem && (
        <DishPhotoLightbox
          dish={openPhotoItem}
          currency={currencies.find((c) => c.id === openPhotoItem.pub?.currency_id)?.symbol ?? "Lei"}
          hasSale={!!openPhotoItem.sale_price && openPhotoItem.sale_price < openPhotoItem.price}
          smallestPrice={openPhotoItem.sale_price && openPhotoItem.sale_price < openPhotoItem.price ? openPhotoItem.sale_price : openPhotoItem.price}
          commission={countCommissionForPub(openPhotoItem.pub ?? {})}
          dishAmount={localCounts[openPhotoItem.id]?.count ?? 0}
          isAvailable={openPhotoItem.available !== false}
          onIncrease={() => handleIncreaseClick(openPhotoItem)}
          onDecrease={() => handleDecreaseClick(openPhotoItem)}
          onClose={() => setOpenPhotoItem(null)}
        />
      )}

      <ConfirmPopup
        opened={!!pendingAdd}
        title={pendingAdd ? `Добавить «${pendingAdd.name}»?` : ""}
        message="В корзине уже есть блюда из другого заведения — добавление этого очистит корзину и начнёт новый заказ."
        confirmLabel="Добавить"
        cancelLabel="Отмена"
        onConfirm={() => { commitAdd(pendingAdd); setPendingAdd(null) }}
        onCancel={() => setPendingAdd(null)}
      />

      <ConfirmPopup
        opened={!!pendingRemove}
        title={pendingRemove ? `Убрать «${pendingRemove.name}» из корзины?` : ""}
        confirmLabel="Убрать"
        cancelLabel="Отмена"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />

      <Toast message={CLOSED_TOAST_MESSAGE} visible={isClosedToastVisible} />
    </div>
  );
};

export default Bestsellers;
