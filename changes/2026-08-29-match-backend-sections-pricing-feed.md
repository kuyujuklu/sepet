# Catching the web menu up with the backend

Date: 2026-08-29
Scope: `front` only. Every field and endpoint used here already exists on the
backend branch; nothing server-side was changed.

Source: `backend/changes/2026-08-26-app-backend-gaps.md` and
`backend/changes/2026-08-27-service-type-moves-to-pub.md`. Those notes list
what *the app* had to do; the same gaps applied here, and this is the web
menu's half of them.

## Sections stop being a guess

`app/utils/sections.js` classified a pub by the `category_types` slugs of its
categories and, because `get-available-pubs` returns no categories, fell back
to a hardcoded table of six pub ids copied from the app. Every pub added after
that table was written was silently filed under food.

A pub's section is now its own field. `sections.js` reads `pub.section` /
`pub.service_types`, the override table and the include/exclude slug matching
are deleted, and `PubList` / `PubCard` follow. Filtering stays client-side (one
fetch, instant tab switching); `?section=` is there if that ever changes.

## The checkout stops disagreeing with the server

Three rules the server applies and the basket did not:

- **Free delivery.** The server zeroes the delivery price at
  `items >= shipping_free_delivery_price`; the basket added `shipping_price`
  unconditionally, so a qualifying order was shown *over*-charged.
- **The minimum.** A delivery order under `shipping_min_order_price` is now
  refused with HTTP 400. The basket never read the field and had no branch for
  the error, so this surfaced as "check your internet connection".
- **The stop list.** Nothing refuses a `available: false` dish on submit, and
  the basket happily ordered one.

`app/utils/pricing.js` holds all three, mirroring `orderservice.CreateOrder`
line for line. It has to be a mirror rather than a call: `POST
/client/orders/preview` is the authoritative pricer, but it is behind the
client role and the web menu orders anonymously through `POST /api/orders`.
The server stays the authority - it prices the order again on submit, and the
receipt now shows the `total_price` that came back rather than a second guess
at it.

The success screen's ETA is the server's `estimated_delivery_time_to` (the
pub's "ready at" estimate plus its advertised window) instead of
`shipping_time_to` added to the browser's clock, which ignored preparation
time entirely.

## The home row is one request

`Bestsellers` fetched every nearby pub's full menu - one request per pub - and
took the first two visible dishes of each, because there was no feed endpoint
and no popularity signal. `get-available-top-dishes` is that endpoint: ranked
by `is_hit` then `orders_count` server-side, closed pubs sunk, pubs
interleaved, section-filtered, with each dish carrying its pub's summary. The
"ХИТ" badge is `is_hit` now rather than "happened to be fetched first".

## Smaller ones

- Dish photos in lists use `image_thumb_file_name` (falling back to
  `image_file_name`, which is what the field is empty for); the lightbox keeps
  the full-size image.
- Reverse geocoding goes through `/api/client/geo/reverse` (Google Maps,
  server-side key) instead of calling OSM Nominatim from the browser. The
  backend has always geocoded through Google, so the address the client
  confirmed and the address the courier reads are now the same one.
- `countCommissionForPub` accepts both shapes the API returns those fields in:
  nested under `shipping` on a full pub, flat on the feed's pub summary.

## Deliberately not done

- **`geo/cities` is not adopted.** `static-data/data.js` keeps its 31 Gagauzian
  town centres. The server dictionary is a coarse 8-city national list, so
  swapping it in would resolve a village to a city 30 km away. It is only ever
  used as the offline fallback when the geocoder is unreachable.
- **`category-types` needs no migration.** The hardcoded `categoryTypes` in
  `static-data/data.js` is dead code here - the menu renders categories from
  the pub response directly. The constant is left alone because the file
  mirrors `admin-front`'s copy.
- **The order history stays in localStorage.** `GET /client/notifications` and
  `GET /client/orders` are authenticated; the web menu has no client identity.
