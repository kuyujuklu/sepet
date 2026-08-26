# Home screen: top dishes feed instead of "pubs near you"

Date: 2026-08-24

## What & why

The first screen used to be a map + a horizontal list of nearby restaurants
("Рестораны возле вас"). The client wanted the entry point to be the best-selling /
best-value dishes of **all** available pubs at once, so a customer can order in a couple
of taps instead of picking a restaurant first, then a category, then a dish.

The feed is built from real menu data (no mocks). Restaurant browsing is not lost: an
"Все рестораны →" link in the feed header goes to the `FoodCategories` screen.

## Files

### Added

- `src/shared/utils/dish.js` — dish price helpers shared by the new widgets:
  `getPubCommission`, `addCommissionToPrice`, `hasDiscount`, `getDiscountPercent`,
  `formatPrice`, `getCurrencySymbol`, and `getDishPrices(dish, pub)` which returns
  `{ price, oldPrice, basketPrice, discountPercent, currency, commission, isOnSale }`.
  `basketPrice` is the price **without** commission — that is what `basketSlice` stores
  (see `increaseDish`), and what `BasketPage` re-applies commission to.
- `src/shared/utils/topDishes.js` — pure feed logic. `topDishesFilters` (`top`/`deals`/
  `near`), `scoreDish`, `buildTopDishes(pubsWithMenus, { filter, limit })`.
- `src/widgets/TopDishes/useTopDishes.js` — hook that loads nearby pubs + their menus and
  returns the built feed.
- `src/widgets/TopDishes/TopDishesList.jsx` — 2-column `FlatList`, header (title, subtitle,
  category navbar, filter chips, "all pubs" link), empty/loading states.
- `src/widgets/TopDishes/TopDishCard.jsx` — grid card: photo, discount / "Хит" badge,
  closed-pub veil, quick "+" → `−  n  +` stepper, name, pub + distance, price + old price.
- `src/widgets/TopDishes/TopDishesFilters.jsx` — horizontal chips (Хиты / Со скидкой /
  Ближайшие).
- `src/widgets/Basket/BasketFloatingBar.jsx` — pill above the tab bar with item count and
  total, shown only when the basket is non-empty; navigates to `Basket`.

### Modified

- `src/pages/Home/Home.jsx` — dropped `PubsMap` + `PubList` + the bottom category row;
  kept the address header and the `possibleCategoryNames` memo (now passed down to
  `TopDishesList`); renders `TopDishesList` + `BasketFloatingBar`.
- `assets/locales/{ru,ro,gz}.js` — added `home_page.top_dishes.*`
  (`title`, `subtitle`, `filter_top`, `filter_deals`, `filter_near`, `all_pubs`,
  `hit_badge`, `closed`, `no_dishes`, `no_deals`, `go_to_basket`).
  ro/gz are my own translations — not native-checked.

`PubsMap` and `PubList` were **not** deleted, they are just no longer used on Home.

## How it works

Data flow (`useTopDishes`):

1. `useGetNearbyPubsQuery` → sort by distance, then open-first, take the **8 closest**
   (`MAX_PUBS_TO_LOAD`).
2. For each of those pubs, `dispatch(pubsApi.endpoints.getPubInfo.initiate({ pubID }))`
   in a `useEffect` keyed on the joined pub ids. `initiate` (not the hook) is used because
   the number of pubs is dynamic. Each request is `.unwrap().catch(() => null)` so one
   dead pub cannot empty the whole feed; the subscriptions are `.unsubscribe()`d on
   cleanup. The cache key matches what `BasketPage` / `DishListForCategory` use, so those
   screens reuse the same cached menus.
3. The pub object stored per menu is `getPubInfo`'s `pub` (it has `currency_id`,
   `shipping.*`, computed `isOpen`) merged with `distance` from the nearby-pubs response,
   because `getPubInfo` does not return distance.
4. `buildTopDishes` scores and merges everything into one list.

Scoring (`scoreDish`) is a **heuristic and should be deleted once the backend can rank
dishes** — see Backend gaps. Today it is:

```
100 - index*4          // position in the menu; restaurants put their best dishes first
+ discountPercent * 3  // a real deal is the strongest signal we have
+ soldCount * 2        // orders_count / sales_count — never sent by the API yet
- distanceKm * 3
+ 15 if the dish has a photo   // a photo-less card sells badly in a grid
```

Then: max 4 dishes per pub (`MAX_DISHES_PER_PUB`), round-robin across pubs so the feed
does not open with five dishes from one restaurant, `deals` re-sorts by discount, `near`
by distance, and a final stable sort pushes closed pubs to the end (they stay visible,
their cards are veiled and the "+" is grey; tapping it opens the existing
`PubNotAvailableForDeliveryPopup`).

Ordering from the card dispatches the same `increaseDish` / `decreaseDish` /
`openDishImagePopup` actions the regular `DishCard` uses, with
`isAvailableForDelivery: true` — the feed only contains pubs returned by
`get-available-pubs`, i.e. pubs that deliver to the current address.

Verified: the feed logic was exercised against mock menus (interleaving, both filters,
closed pubs last, empty input). The app itself was **not** launched.

## Backend gaps

1. `missing data` — **no popularity / sales data on dishes.** Nothing in the API says how
   often a dish is ordered, so "хиты продаж" is currently guessed from menu position +
   discount. Needed: a per-dish counter over a rolling window, e.g.
   `orders_count_30d` (and ideally `rating` / `rating_count`).
   `scoreDish` already reads `dish.orders_count` / `dish.sales_count`, so shipping either
   name makes the feed real immediately; the `100 - index*4` term can then be dropped.
2. `API change needed` — **no aggregated endpoint.** Opening Home fires up to 8 parallel
   `/api/client/pub/id/{id}` calls, each returning a **full menu** just to use a handful
   of dishes. Wanted:
   `GET /api/client/get-available-top-dishes?lat=&lng=&filter=top|deals|near&limit=&offset=`
   returning already-ranked dishes with an embedded pub summary
   (`pub_id`, `pub_name`, `distance`, `is_open`, `currency_id`, and the
   `shipping.delivery_type` / `add_commission_to_dish_prices` /
   `commission_for_dish_prices` fields needed to price a dish).
   That would collapse `useTopDishes` to one query and let the ranking live server-side.
3. `missing data` — **no availability / stop-list flag on a dish.** Only `visible` exists.
   A sold-out dish can be added to the basket straight from the feed. Wanted:
   `is_available` (or `stop_list: true`) so the card can be greyed out.
4. `missing data` — **no image thumbnails.** Only `image_file_name`, so a 2-column grid
   downloads full-size dish photos. Wanted: `image_thumb_file_name` or a resizing static
   endpoint (`/images/dishes/thumb/<file>`), otherwise the feed is heavy on mobile data.
5. `missing data` — **`distance` only exists on `get-available-pubs` items**, not on
   `/api/client/pub/id/{id}`, which is why the client merges the two objects by hand.
   Returning `distance` (for given `lat`/`lng`) from the pub-info endpoint would remove
   that merge.
6. `API change needed` — **no pagination for a feed.** The client hard-caps at 8 pubs ×
   4 dishes. With `limit`/`offset` (item 2) the feed could load more on scroll.
7. Unverified: whether `get-available-pubs` items carry `currency_id` and the full
   `shipping` commission fields. The client currently avoids the question by pricing from
   the pub-info response. Worth confirming — if they are there, fewer merges are needed.

## Known limits / follow-ups

- 8 parallel menu requests on Home open. Acceptable on cache, bad on a cold start over a
  slow connection. Fixed properly only by backend gap #2.
- `top` marks the first 2 cards as "Хит" purely by feed position (`HITS_COUNT`), because
  there is no real hit flag.
- ro/gz strings need a native speaker's review.
- `PubsMap` / `PubList` are now unused on Home; if the map is not coming back, they can be
  deleted along with `home_page.pubs_near_you`.
