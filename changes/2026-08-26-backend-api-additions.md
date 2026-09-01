# The backend gaps the app recorded, implemented

Date: 2026-08-26
Scope: backend (this repo) + admin panel (`admin-front` branch). **The app was not
touched** — everything below is server-side; the list at the bottom is what the app has
to do to use it.

Source: the `Backend gaps` sections of the app's own notes
(`changes/2026-08-24-home-top-dishes.md`, `2026-08-24-navigation-rework.md`,
`2026-08-25-catalog-views-basket-checkout.md`, `2026-08-25-sections-and-soft-location.md`,
`2026-08-26-first-screen-controls-orders-safe-areas.md`).

## Sections: food / flowers / groceries

A **category** now carries a `service_type` (`food` | `flowers` | `groceries`), set in the
admin panel. It is the only place a section is decided; a **pub** derives its sections
from its visible categories and reports them as `service_types: []` plus `section` (the
first one) on every pub object. That is the "no section on a pub" gap, and it is also what
finally identifies a grocery store: one whose categories are tagged `groceries`.

Migration backfills the field: a category tagged `flowers` becomes flowers, one tagged
`groceries` becomes groceries, everything else food — so nothing moves section on deploy.

`?section=food|flowers|groceries` filters `get-available-pubs`, `get-available-categories`
and the new feed endpoint.

## New model fields

| Entity | Field | Why |
| --- | --- | --- |
| dish | `is_hit` | the "хит продаж" badge was guessed from feed position |
| dish | `available` | stop list — a sold-out dish looked orderable |
| dish | `orders_count` | real popularity, replaces the client's `scoreDish` heuristic |
| dish | `image_thumb_file_name` | generated on upload; the grid downloaded full-size photos |
| dish output | `category_types`, `service_type` | copied from the category: no dish → category → slug join |
| category | `service_type` | see above |
| shipping | `shipping_min_order_prices` (per shape) | "minimum order 150 lei" |
| order | `items_price`, `total_price` | totals were recomputed on the client |
| order | `source` (`application` \| `web_menu` \| `admin`) | corroborating client funnels |
| order dish | `name`, `image_file_name` | snapshot: a deleted dish still prints on the order |
| order | `status_history[]` | `{status, time}` per step — a timeline, not one badge |
| client | `id` | stable analytics id that is not the phone number |
| client | `analytics_consent`, `consent_policy_version` | consent record + kill switch |

Dishes and categories are now returned ordered by `place`, so a pub controls what comes
first.

## New endpoints

- `GET /api/client/get-available-top-dishes?lat&lng&filter=top|deals|near&category=&section=&limit=&offset=`
  — the aggregated feed. Ranked server-side (hits, then `orders_count`, then place;
  `deals` sorts by discount, `near` by distance; closed pubs sink), interleaved so one pub
  cannot fill the screen, paged, and every dish carries a `pub` summary with
  `distance`, `is_open`, `currency_id`, the shipping prices and the commission fields.
  Replaces the 8 parallel full-menu requests on Home.
- `GET /api/client/category-types[?service_type=]` — the category dictionary
  (`slug`, `name_ru/ro/gz`, `service_type`, `priority`). Icons stay in the app for now,
  `icon_file_name` is reserved and empty.
- `GET /api/client/service-types` — the three sections.
- `GET /api/client/app-settings` — support phone/telegram, privacy policy url and
  version, app versions, delivery commission. Overridable per environment
  (`SUPPORT_PHONE`, `SUPPORT_TELEGRAM`, `PRIVACY_POLICY_URL`, `PRIVACY_POLICY_VERSION`).
- `GET /api/client/geo/cities` — the city dictionary, seeded with the eight cities and
  the exact coordinates the app shipped with.
- `GET /api/client/geo/reverse?lat&lng` and `GET /api/client/geo/search?q=` — reverse and
  forward geocoding through Google Maps (`GOOGLE_MAPS_API_KEY`, `GEOCODING_COUNTRY`,
  default `MD`). Forward geocoding is what stops an order from travelling with
  city-level coordinates.
- `POST /api/client/orders/preview` — same body as creating an order, returns the
  authoritative `items_price` / `delivery_price` / `free_delivery_price` /
  `min_order_price` / `total_price`, plus `unavailable_dish_ids` and `can_be_ordered`.
- `POST /api/client/analytics-consent` — `{accepted, policy_version}`.
- `GET /api/client/orders?status=active|<status>` — filters the list, and every response
  carries `has_active_order`. `GET /api/client/` carries it too (the profile badge).
- `GET /api/client/pub/id/{id}?lat&lng` — the by-id route now accepts coordinates like
  the by-url-name one and answers with `distance`, `shipping_price`,
  `shipping_free_delivery_price` and `shipping_min_order_price`, so no screen has to hold
  two responses to show a price.
- `POST /api/company/{companyID}/pubs/{pubID}/shipping-min-order-prices` — the panel side
  of the minimum.

## Behaviour changes worth knowing

- **A delivery order under the pub's minimum is now refused** with
  `order is below the minimum order price of the pub` (HTTP 400). It used to be accepted.
  The preview endpoint reports the same rule before the client submits.
- Free delivery now triggers at `items >= threshold` (it was strictly greater), which
  matches how "бесплатная доставка от X" is advertised and what the app already does.
- Ordering a dish increments its `orders_count`.
- `is_open` on the pub summary reads the per-day work hours, falling back to the single
  start/end pair; a pub with neither configured counts as open, as before.

## What the app has to change (not done here)

1. **Home feed** — replace `useTopDishes`' N full-menu requests with
   `get-available-top-dishes`. `scoreDish` and the `100 - index*4` term can go; hits come
   from `is_hit`, not from `HITS_COUNT` by position.
2. **Categories** — drop `placeholderCategories`, `getCategoryTranslationKey` and the
   `categories.*` locale block in favour of `category-types` (keep the icons, key them by
   slug).
3. **Sections** — `src/shared/utils/sections.js` can be deleted: filter pubs by
   `section` / `service_types`, or pass `?section=` and let the server do it. The
   include/exclude asymmetry and the `getDishSlugs` join are no longer needed, and
   groceries can be switched on (`available: true`) as soon as a store is tagged.
4. **Basket / checkout** — grey out dishes with `available: false`; show
   `shipping_min_order_price`; call `orders/preview` and display its totals instead of
   `shared/utils/basket.js` arithmetic (keep the local sum only as an offline fallback).
5. **Order screens** — read `dishes[].name`/`image_file_name`, `items_price`,
   `total_price` and `status_history`; `OrderInfo` no longer needs `getPubInfo`, and
   `useRepeatOrder` needs the menu only for today's prices.
6. **Orders list** — `GET /orders` for the first paint (the 900 ms grace timer in
   `OrdersPage` can go), websocket for updates; badge the profile button off
   `has_active_order`.
7. **Images** — use `image_thumb_file_name` when it is not empty
   (`/static/images/dishes/<file>`), fall back to `image_file_name`.
8. **Cities / geocoding** — `shared/utils/cities.js` becomes `geo/cities`; geocode the
   checkout address with `geo/search` so the order carries real coordinates.
9. **Profile** — support contacts from `app-settings`; store the consent through
   `analytics-consent` and use `client.id` as the analytics identity.
10. **Pub info** — pass `lat`/`lng` to `/client/pub/id/{id}` and drop the merge with the
    nearby-pubs entry.

## Still open

- **No icons for category types on the server** (`icon_file_name` is always empty) — the
  app keeps its PNG set.
- **No server-side order events**; `source` is the only thing recorded about where an
  order came from.
- **No server-side address book / address labels** ("Дом", "Работа") — still AsyncStorage.
- **No ETA per status**, only the timestamps of the transitions.
- **No pagination for the orders list** (the feed has it).
- `orders_count` is a lifetime counter, not the rolling 30-day window the note asked for.
- `docs/swagger.json` was **not** regenerated: `swag init` fails on a pre-existing missing
  type in `src/controllers/httpv1/routes/admin/admin-functions.go`. The new endpoints do
  carry swag annotations, so the docs come back as soon as that is fixed.
