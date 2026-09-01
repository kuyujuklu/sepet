# Adopting the new backend API in the app

Date: 2026-08-27
Scope: `app` only. Backend and `admin-front` were **not** touched.

## What & why

`changes/2026-08-26-backend-api-additions.md` is the backend's own note about the gaps
this app recorded, implemented server-side. Its last section is a ten-item list of what
the app has to change to use them. This is that work: the home feed is one request
instead of eight, the category taxonomy / city list / support contacts / section list are
server dictionaries instead of hardcoded tables, the pub's section is a field instead of
a rule guessed from category slugs, checkout is priced by `orders/preview` instead of
client arithmetic, and the order screens read the snapshot fields the order now carries.

## Files

### Added

- `src/shared/api/dictionaries/dictionariesApi.js` — `category-types`, `service-types`,
  `app-settings`.
- `src/shared/api/geo/geoApi.js` — `geo/cities`, `geo/reverse`, `geo/search`.
- `src/shared/utils/geo.js` — city-name localisation, nearest-city math, and non-React
  wrappers over the three geo endpoints (`fetchCities` / `reverseGeocode` /
  `geocodeAddress`), so `describeCoords` and checkout can use them with a `dispatch`.
- `src/shared/hooks/useCategoryTypes.js` — the localized category dictionary, plus
  `getName(slug)` and `sortSlugs()` (priority order).
- `src/shared/hooks/useCities.js` — city list ordered by `place`, names in the current
  language.
- `src/shared/hooks/usePubInfo.js` — pub-info **always** asked for with the current
  coordinates. Every caller goes through it so they share one cache key.
- `src/shared/hooks/useOrderPreview.js` — debounced `POST /orders/preview`; returns the
  server totals, `unavailable_dish_ids` and `can_be_ordered`.
- `src/shared/hooks/useGeocodedAddress.js` — forward-geocodes the typed address into the
  point an order travels with, with a drift guard.
- `src/shared/hooks/useHasActiveOrder.js` — `has_active_order` for the profile badge.
- `src/widgets/Orders/OrdersList/OrderStatusTimeline.jsx` — the order's `status_history`
  as a timeline.

### Removed

- `src/shared/utils/cities.js` — the hardcoded eight-city table; now `geo/cities`.
- `categories.*` per-slug names and the whole `cities.*` block from all three locales.
- `categories` (the slug enum) from `src/app/static-data/data.js`.

### Rewritten / modified (one line each)

- `src/shared/api/pubs/pubsApi.js` — added `getTopDishes` (the aggregated feed, with
  paging that appends via `serializeQueryArgs`/`merge`/`forceRefetch`), `?section=` on
  nearby-pubs, `lat`/`lng` on pub-info, and a query builder that drops absent params.
- `src/shared/api/categories/categoriesApi.js` — `?section=`.
- `src/shared/api/client/clientApi.js` — `setAnalyticsConsent` mutation; `getClient`
  provides the `Client` tag.
- `src/shared/api/ordersApi/ordersApi.js` — one shared `buildOrderBody` (with
  `source: "application"`) for create *and* preview, `previewOrder`, `?status=` on the
  list.
- `src/shared/utils/sections.js` — cut from ~180 lines of include/exclude rules and
  per-pub overrides down to icons + i18n keys + `pubMatchesSection(pub, sectionId)`.
- `src/shared/utils/foodCategories.js` — icons only (`categoryIcons`, `getCategoryImage`).
- `src/shared/utils/topDishes.js` — `scoreDish`/`buildTopDishes` deleted; only
  `searchDishes` remains.
- `src/shared/utils/dish.js` — `getPubCommission` reads both pub shapes,
  `getDishImagePath` (thumb-first), `isDishAvailable`.
- `src/shared/utils/pub.js` — `getPubWorkHours` now mirrors the server's
  `IsShippingWorkingNow`, and separates "delivers here" from "open now".
- `src/shared/utils/basket.js` — kept as the offline fallback; added
  `getMinOrderPrice` / `getAmountLeftForMinOrder`.
- `src/shared/utils/geolocation.js` — `describeCoords(dispatch, coords)`: server reverse
  geocoding first, device geocoder second, nearest city last.
- `src/shared/hooks/useNearbyCategoryNames.js` — takes a `sectionId`, drops the
  `categorySlugsById` join and the nearby-pubs cross-check.
- `src/widgets/TopDishes/useTopDishes.js` — the feed endpoint + paging; the per-pub menu
  loading survives **only** for search.
- `src/widgets/TopDishes/TopDishesList.jsx` — no `HITS_COUNT`, `onEndReached` paging,
  footer spinner.
- `src/widgets/TopDishes/TopDishCard.jsx` — `is_hit`, `available`, thumbnails.
- `src/widgets/TopDishes/FiltersSheet.jsx`, `FiltersButton.jsx`,
  `FoodCategories/CategoriesCarousel/*` — names/order from the dictionary; `CategoryChip`
  takes a `label` instead of translating a key.
- `src/widgets/Pub/PubsList.jsx` — server-side section filter; the categories request is
  now only made when a category chip is active.
- `src/widgets/Dish/DishRow.jsx`, `DishCard.jsx`, `DishImagePopup.jsx`,
  `Basket/BasketItemRow.jsx` — stop-list state and thumbnails.
- `src/pages/Basket/BasketPage.jsx`, `widgets/Basket/BasketCreateOrderButton.jsx`,
  `BasketFloatingBar.jsx` — preview totals, minimum-order rule, no nearby-pubs merge.
- `src/pages/CreateOrder/CreateOrderPage.jsx`, `widgets/Orders/CreateOrder/CreateOrder.jsx`
  — preview + geocoded coordinates; also fixed `addOrder(order)` → `addOrder({ order })`.
- `src/widgets/Orders/OrdersList/OrderInfo.jsx` — snapshot names, `items_price` /
  `total_price`, timeline; no longer loads the pub's menu at all.
- `src/widgets/Orders/useRepeatOrder.js` — one pub-info request with coordinates answers
  zone + open + today's prices; refuses a dish that is on the stop list.
- `src/pages/Orders/OrdersPage.jsx` — `GET /orders` for the first paint; the 900 ms grace
  timer is gone.
- `src/widgets/AppHeader/ProfileButton.jsx` — active-order dot.
- `src/pages/Profile/ProfilePage.jsx` — support contacts + policy link from
  `app-settings`, analytics-consent switch.
- `src/pages/PubInfo/PubInfoPage.jsx`, `Menu/FullMenuList.jsx`,
  `FoodCategories/CategoriesList/CategoryList.jsx`, `Dish/DishListForCategory.jsx`,
  `features/store/linking/LinkingWathcer.jsx` — all on `usePubInfo`.
- `src/pages/Sections/SectionPickerPage.jsx`, `widgets/Sections/SectionCard.jsx` —
  availability from `service-types`, not a hardcoded flag.
- `src/widgets/Geolocation/CityPicker.jsx`, `SelectGeolocation.jsx`,
  `GeolocationFinder.jsx`, `SelectGeolocationInputs.jsx` — city dictionary + server
  geocoding.
- `src/features/store/auth/authSlice.js`, `AuthWatcher.js`,
  `features/store/analytics/analyticsMiddleware.js`,
  `shared/analytics/analytics.js` — `client.id` as the analytics identity and the consent
  kill switch.
- `src/app/errors/appErrors.js`, `convertApiErrors.js` — the minimum-order 400.
- `src/features/store/configureStore.js` — the two new API reducers/middlewares.

## How it works

**The feed.** `useTopDishes` calls `get-available-top-dishes` with
`lat/lng/filter/category/section/limit/offset`. Paging appends rather than replaces:
`serializeQueryArgs` strips `offset` out of the cache key, `merge` concatenates (deduping
on `pub.id-dish.id`) unless `offset === 0`, and `forceRefetch` fires when the offset
changes. `offset` resets whenever the filter, category, section or location changes.
The response's pub summary is flat (`is_open`, `shipping_price`, …) while the rest of the
app reads `pub.isOpen`, so the transform aliases that one field and `getPubCommission`
learned to read both shapes rather than every card being taught two shapes.

**Search is the exception.** The feed endpoint has no `?q=`, so losing the per-pub menu
loading entirely would have cost dish search. It survives, but only while the search
input is open: `useTopDishes` then loads up to 30 menus exactly as before and
`searchDishes` matches names. The dish → category → slug join is gone from it because a
dish now carries its own `service_type`.

**Sections.** `sectionIds` are the server's `service_type` values verbatim, which is why
`sections.js` collapsed: `?section=` filters pubs, categories and the feed server-side,
and `pub.service_types` answers "which section is this pub in" directly. The
`pubSectionOverrides` table (six pubs hand-mapped by id, confirmed against the live API)
is deleted — those pubs are now correct because their categories carry a `service_type`.
The `include`/`exclude` asymmetry is gone with it.

**Pub-info and coordinates.** `usePubInfo` is the single entry point, and it always
passes the current lat/lng. That matters twice: the response then carries `distance` and
the three shipping prices (so no screen merges nearby-pubs into pub-info any more), and
every caller produces the same cache key so RTK Query still dedupes them into one
request. Calling `useGetPubInfoQuery` directly would silently open a second,
coordinate-less entry with no prices in it — hence the comment on the hook.

With coordinates, `shipping.available === false` means "does not deliver to this point",
which is a different thing from "closed". `getPubWorkHours` now returns both
(`isDeliveryAvailable`, `isAvailableForDelivery`) and mirrors the server's own is-open
rule (per-day hours → single pair → unconfigured counts as open), so the feed's `is_open`
and the flag computed from pub-info cannot disagree.

**Money.** `orders/preview` takes the same body as creating the order — one
`buildOrderBody` builds both, which is the only reason the preview is authoritative. The
basket and checkout screens show the preview's `items_price` / `delivery_price` /
`total_price` / `min_order_price`, and fall back to `shared/utils/basket.js` while it is
in flight or when it failed. Preview is debounced 350 ms so a stepper tapped five times
is one round trip. `can_be_ordered` false disables the checkout button *visually* but
keeps it pressable, so the tap can explain why (stop list vs. minimum) instead of doing
nothing.

**Coordinates of an order.** Only geocoded when the location is approximate — if the
client pinned a point on the map, that pin already *is* the address and looking it up
again could only make it worse. A geocoded point more than 50 km from where we already
believe the client is is discarded (Google will answer a half-typed street with a match
in another town, and the delivery price is calculated from the point).

**Consent.** A client who has never been asked and one who refused both have
`analytics_consent: false`; the *policy version* is what distinguishes them. Undecided
keeps tracking on (which is how the app behaved before the record existed, and no event
carries PII); an explicit "no" turns it off. `client.id` rides on every event as
`client_id`.

**Dictionaries.** Category names come from `category-types` (`name_ru/ro/gz`, `priority`)
and city names from `geo/cities`, so both locale blocks are gone and a new category type
or city reaches a released app. The icons stayed in `foodCategories.js` because
`icon_file_name` is still empty server-side; an unknown slug falls back to the neutral
"all" icon rather than rendering blank.

## Backend gaps

- `missing data` — **No `?q=` on `get-available-top-dishes`.** Dish search is the only
  reason `useTopDishes` still loads up to 30 full menus in parallel. A `q` parameter on
  the feed endpoint would let the whole per-pub loading path (and `searchDishes`) be
  deleted.
- `missing data` — **No icons for category types** (`icon_file_name` is always empty), so
  `categoryIcons` in `shared/utils/foodCategories.js` is still a hand-maintained PNG map
  keyed by slug. It can go the moment the field is filled.
- `missing data` — **No pagination on `GET /orders`.** The orders screen loads the whole
  history in one request.
- `missing data` — **No ETA per status**, only transition timestamps, so
  `OrderStatusTimeline` shows when each step happened and never when the next one will.
- `missing data` — **No server-side address book / labels** ("Дом", "Работа"); still
  AsyncStorage via `shared/utils/savedAddresses.js`.
- `API change needed` — **`orders/preview` returns no per-line prices with commission**
  applied in a form the checkout can print. The screen still renders each line with
  `getBasketItemPrice`, so a line total can be a rounding step away from the preview's
  `items_price`. Returning the priced lines (it already computes them) would let the
  local math go entirely.
- `API change needed` — **`get-available-top-dishes` has no "why is this pub closed"
  signal**; the feed's `is_open` conflates hours with the delivery zone the same way the
  client used to.
- `missing data` — `orders_count` is a lifetime counter, not a rolling window, so the
  "хит" ranking drifts towards old dishes over time. (Server-side ranking, so nothing for
  the client to work around — noted for whoever tunes it.)

## Known limits / follow-ups

- **`getPubWorkHours` behaviour change.** A pub whose shipping is globally disabled used
  to read as closed on the coordinate-less pub-info response; it now reads as
  "open but not delivering here". Every screen shows the delivery warning ahead of the
  closed one, so the message is if anything more accurate, but it is a real change and
  worth a look on a real pub with `shipping.available = false`.
- **Not verified against a live server.** All of this was built against the backend's
  handlers and entity structs read from `../backend/src`. Field names and shapes match
  what those emit; nothing was exercised end to end.
- **ro/gz strings are approximate** (privacy/consent rows, sold-out, minimum-order) and
  should get a native check. Pre-existing parity gaps in ro/gz are untouched.
- **`OrderStatusProgress` is still used** as the fallback for orders created before
  `status_history` existed. It can be deleted once no such order is reachable.
- The consent switch lives in the profile screen only — there is no onboarding prompt, so
  a client who never opens the profile is never asked and stays "undecided".
- `expo-navigation-bar` is declared in `package.json` but missing from `node_modules` in
  this working tree. `npx expo export` fails to resolve it out of `App.js` until it is
  installed; the bundle check for this change was run with a local stub of it, which was
  then removed.
