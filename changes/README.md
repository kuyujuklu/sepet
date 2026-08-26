# changes/

Notes I write for myself about every change made in this repo — see the rule in
`../CLAUDE.md`. The user does not read these; they exist so a future session can pick up
the work without re-reading the whole codebase.

Newest first.

- [2026-08-26 — First screen language, home controls in popups, orders redesign, safe areas](2026-08-26-first-screen-controls-orders-safe-areas.md)
  — language switch on the section picker, real top/bottom insets on every screen (Android
  edge-to-edge), back arrows everywhere (incl. the auth screens and the nested pub category
  view), half-screen category strip + a filters button that opens a sheet, "Хиты продаж"
  text moved under the controls, and both order screens redrawn in the app's card style.
  Backend gaps: order dishes carry no names, no totals and no pub object on an order, no
  status history, orders only over the websocket.
- [2026-08-25 — Catalog views, loaders, basket rework, checkout redesign](2026-08-25-catalog-views-basket-checkout.md)
  — dish cards + view switch on the "all pubs" screen, whole-menu view inside a pub,
  skeleton loaders everywhere, the missing basket pill, a real basket (subtotal, add
  more, remove confirmation) and a card-based checkout. Backend gaps: no stop-list, no
  minimum order sum, delivery price missing from pub-info, no server-side order preview.
  Second dated section: fixed the basket submit button, establishments as a filter chip on
  Home, menu tabs removed, pub info behind a button, one screen gutter, FoodCategories
  screen deleted. Third section: view-switch labels fixed, one shared QuantityStepper and
  one shared BottomSheet for every popup. Fourth section: checkout polish (visible input
  borders, one address button), Android navigation-bar strip under sheets, and a
  production pass (no logging, saner polling, shared skeleton pulse). 2026-08-26 section:
  fixed the startup crash (memo used without its import), moved Screens out of App.js to
  break every require cycle, and wrote down a verification recipe that catches both. Also
  2026-08-26: the Play Store rejection was a stale versionCode (51 in git vs 63 on EAS),
  not a code change.
- [2026-08-25 — Sections (food/flowers/groceries) and a non-blocking location](2026-08-25-sections-and-soft-location.md)
  — section picker as the first screen, section switcher in the top bar, approximate
  location at startup with a city-list fallback, exact address collected at checkout.
  Second dated section: reverse geocoding + nearest-city fallback names the approximate
  location, and checkout/top bar/address screen all say where the order is going.
  Backend gaps: no section field on a pub, no grocery signal, no reverse-geocoding, no
  city dictionary.
- [2026-08-24 — Navigation rework: no tab bar, shared top bar, captioned categories](2026-08-24-navigation-rework.md)
  — removed the bottom bar, added AppHeader + Profile screen, captions on the category
  carousel, in-place category filtering of the home feed, analytics facade. Backend gaps:
  no server category dictionary, no dish category slugs, no stable client id, no consent.
- [2026-08-24 — Orphaned promotions files](2026-08-24-orphaned-promotions-files.md)
  — unfinished, currently broken promotions widgets/api left untracked in the tree after a
  `git reset --hard`. Read before touching anything named "promotion".
- [2026-08-24 — Home screen: top dishes feed instead of "pubs near you"](2026-08-24-home-top-dishes.md)
  — replaced the map + nearby-pubs list with a cross-restaurant feed of best-value dishes
  and one-tap add to basket. Backend gaps: no dish popularity data, no aggregated
  top-dishes endpoint.
