// Shared by any component outside /pub/[pubID] that needs to read or write
// the cart without redux - that's the only place StoreProvider (and so
// basketSlice/basketMiddleware/BasketPreloader) is mounted (see
// PubPage.jsx), so the landing page can't dispatch into it directly.
// Mirrors store.js's isTimeInLocalStorageExpired() and the same
// localStorage shape basketMiddleware.js writes: whatever gets added here
// is picked up by BasketPreloader the moment a client opens a pub page.
const BASKET_KEY = "basket";
const LAST_ACTION_KEY = "lastBasketAction";
const BASKET_EXPIRY_MS = 1000 * 60 * 60 * 24;

// The native `storage` event only fires in OTHER tabs, never the one that
// called localStorage.setItem - same-page siblings (the bestsellers row,
// the floating cart button) need this instead to notice each other's writes.
export const BASKET_UPDATED_EVENT = "sepet:basket-updated";

export const readLocalBasket = () => {
  try {
    const lastAction = parseInt(localStorage.getItem(LAST_ACTION_KEY));
    if (!lastAction || lastAction + BASKET_EXPIRY_MS < Date.now()) return {};
    return JSON.parse(localStorage.getItem(BASKET_KEY)) || {};
  } catch (e) {
    return {};
  }
};

export const writeLocalBasket = (basket) => {
  try {
    localStorage.setItem(BASKET_KEY, JSON.stringify(basket));
    localStorage.setItem(LAST_ACTION_KEY, Date.now().toString());
  } catch (e) {
    console.log("err writing basket to loc stor: ", e);
  }
  window.dispatchEvent(new Event(BASKET_UPDATED_EVENT));
};
