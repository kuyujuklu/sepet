# changes/

Notes I write for myself about every change made in this repo — see the rule in
`../CLAUDE.md`. The user does not read these; they exist so a future session can pick up
the work without re-reading the whole codebase.

Newest first.

- [2026-08-31 — Wire the analytics event catalogue to Firebase Analytics](2026-08-31-firebase-analytics-sink.md)
  — `setAnalyticsSink()` was never called (catalogue/middleware were already fine,
  see the 2026-08-27 note below); added `firebaseAnalyticsSink.js` wiring
  `track()`/`trackScreen()` to `@react-native-firebase/analytics` (modular API -
  namespaced API is gone in this SDK version), plus the two Expo config plugin
  entries (`disableSPM`, `withoutAdIdSupport`) a working native build needs.
  2026-09-01 section: the Android native build was actually failing
  (`@react-native-firebase` 26.x requires RN 0.81+'s CMake API); pinned both
  packages to 25.1.0.
- [2026-08-27 — Service type is the pub's field now (app side)](2026-08-27-service-type-on-pub.md)
  — `service_type` moved from the category to the pub (set in the pub settings popup);
  the app needed no functional change because it already read `pub.section` /
  `pub.service_types` and `dish.service_type`, so this is a comment correction plus the
  one visible consequence: a category now belongs to its pub's section.
- [2026-08-27 — Pointing the app at the local backend (:9999)](2026-08-27-point-app-at-local-server.md)
  — flipped `EXPO_PUBLIC_IS_DEV` on and made `dev.js` derive the host from Metro's own
  hostUri instead of a hardcoded LAN IP that had gone stale, with an
  `EXPO_PUBLIC_API_HOST` override for the Android emulator. `.env` is not gitignored —
  blank the flag before a release build.
- [2026-08-27 — Adopting the new backend API in the app](2026-08-27-adopt-backend-api-additions.md)
  — the app side of `2026-08-26-backend-api-additions.md`: home feed is one
  `get-available-top-dishes` request instead of eight menus, sections/categories/cities/
  support contacts come from server dictionaries, pub-info is always asked for with
  coordinates (one cache entry, prices included), checkout is priced by `orders/preview`
  and refuses under the pub's minimum, order screens read the snapshot fields and
  `status_history`. Backend gaps: no `?q=` on the feed (search still loads 30 menus), no
  category icons, no orders pagination, no ETA per status.
- [2026-08-27 — Analytics: fix dead basket_cleared, a double-fire, inconsistent payloads](2026-08-27-analytics-cleanup.md)
  — `basket_cleared` now actually fires (was declared, never wired); `address_selected`
  was firing twice for 2 of its 3 flows (widget + middleware both reacting to the
  same redux action) plus a spurious third time on checkout's address re-confirm -
  middleware no longer reacts to that action at all; `feed_filter_changed` payloads
  unified to `{filter_type, value}` across all three call sites.
- [2026-08-27 — Push notification copy proposal for order statuses](2026-08-27-push-notification-copy-proposal.md)
  — investigated: push text is 100% backend-owned, this client has no hook to
  change it. Wrote refined copy for all 6 statuses (client's draft covered 5) for
  the backend team to implement, with placeholder fields noted.
- [2026-08-27 — Order screen: rate button fix, status clarity, missing checkout data](2026-08-27-order-info-screen-cleanup.md)
  — "Оценить" now matches "Повторить"'s pill size/shape (was bigger, no padding, a
  mismatched icon); swapped its thumbs-up/down icon for a star. Status badge gets an
  icon + a 5-segment progress bar; `handled` no longer shares `not_handled`'s color.
  Payment method/phone/comments shown on the order screen if the API actually
  returns them (unconfirmed - defensive, no new locale strings needed).
- [2026-08-27 — Android nav bar buttons invisible on a dark system theme](2026-08-27-android-navbar-icon-contrast.md)
  — `userInterfaceStyle: automatic` + edge-to-edge meant the system nav bar's icon
  color followed the *phone's* theme, not the app's (always-light) screens: white
  icons on a dark-themed phone vanished against them. New `expo-navigation-bar`
  dependency, forced to `"dark"` once at startup, same fix family as the already
  forced `<StatusBar style="dark" />`. Needs a new native build to take effect.
- [2026-08-27 — Free-delivery nudge on the floating basket bar](2026-08-27-free-delivery-nudge-on-floating-bar.md)
  — "X left for free delivery" (already shown on the Basket screen) now also shows
  above the floating basket pill on Home and the pub menu screen, so it updates
  live as dishes are added/removed there. New `FreeDeliveryHint.jsx`, shared by
  both places instead of two copies.
- [2026-08-27 — Dish search on the Home feed](2026-08-27-home-dish-search.md)
  — search icon between Скидки and Все рестораны; expands to a full-width input, results
  in the same product-card grid. Searches all nearby pubs (not just the 8 loaded for
  Хиты), widening `useTopDishes`'s pub cap only while search is open. Later same day: real
  900ms debounce (`useDebouncedValue`, replacing `useDeferredValue`) + 4-char minimum, so
  it stops firing after 2-3 keystrokes; then a `Keyboard.dismiss()` once results settle.
- [2026-08-27 — "Скидки" chip label + new deals headline copy](2026-08-27-deals-copy-refresh.md)
  — "Со скидкой" → "Скидки"; deals headline now "Горячие предложения" / "Собрали для вас
  самые выгодные позиции". Pure locale-string change, all three languages.
- [2026-08-27 — "Все X" pinned outside the scroll, Фильтровать/Сортировать only for establishments, new sort order](2026-08-27-pubs-fixed-chip-conditional-filters-sort.md)
  — the section-aware establishments chip is now a fixed non-scrolling element pinned
  right; Фильтровать (categories/free-delivery) and the new Сортировать button
  (рейтинг/расстояние/скорость доставки) only show while the establishments view is open.
- [2026-08-27 — Дальше/Создать заказ: snug card, safe-area padding split out](2026-08-27-bottom-bar-snug-card.md)
  — the bordered "card" around these buttons no longer grows with the device's safe-area
  inset; that clearance moved into a borderless outer layer with the same background, so
  the button sits snugly in a fixed-size card instead of floating high in an oversized one.
- [2026-08-27 — Fix: gap under Дальше/Создать заказ bars showing list content](2026-08-27-bottom-bar-flush-to-edge.md)
  — BasketPage/CreateOrder's bottomBar back to `bottom: 0`, safe-area clearance moved into
  `paddingBottom` instead, so the bar's opaque background reaches the true edge instead of
  floating above a gap. useSafeBottomInset's doc comment now spells out the two different
  uses (floating pill vs full-width bar) to stop this mix-up from happening again.
- [2026-08-27 — Checkout "Изменить адрес" opens the real address screen; auto-detected town/street](2026-08-27-checkout-goes-to-address-screen.md)
  — deleted AddressPickerSheet, checkout now navigates to SelectGeolocationPage like every
  other address entry point; picking an address there now returns to wherever you came
  from (goBack) instead of always bouncing to Home; SelectGeolocationInputs pre-fills
  town/street via reverse geocoding (`describeCoords`, extracted from GeolocationFinder).
- [2026-08-27 — Checkout address: drop the duplicate inputs, add a save-for-later choice](2026-08-27-checkout-address-redesign.md)
  — removed the redundant raw town/full-address text fields under the address card;
  kept the display+"Изменить адрес" version; new checkbox to use an address just for
  this order without adding it to the saved list.
- [2026-08-27 — Remove the 20s background polling causing visible reloads](2026-08-27-remove-background-polling.md)
  — dropped `pollingInterval` from every live screen's nearby-pubs/pub-info queries
  (Home, pub menu, basket, checkout, repeat-order); data now refreshes on mount and via
  pull-to-refresh instead of a 20s timer. Left VersionWatcher (5 min) and 3 confirmed-dead
  files alone.
- [2026-08-27 — Manual section overrides for 6 pubs (flowers/groceries leaking into food)](2026-08-27-pub-section-overrides.md)
  — Rray_decor/FloraDelivery forced to flowers, Дары природы/Mars/Люкс/Алёнушка forced to
  groceries (`pubSectionOverrides` in sections.js, keyed by pub id, verified against each
  pub's real category data from the live API); groceries section flipped `available: true`.
- [2026-08-27 — Pull-to-refresh: Home feed, establishments view, orders list](2026-08-27-pull-to-refresh.md)
  — swipe-down refresh on the dish feed, the "Все рестораны/цветочные/продуктовые" view,
  and the orders list (the last one calls the REST orders endpoint that existed unused
  since before this session and writes into the same slice the websocket uses).
- [2026-08-27 — "Все рестораны/цветочные/продуктовые" back in the carousel, Фильтровать moves below, free-delivery filter](2026-08-27-pubs-chip-back-filters-free-delivery.md)
  — section-specific establishments chip back in the sort carousel; Категории button
  (renamed Фильтровать) moved to its own row below; new free-delivery filter inside it
  (`pub.shipping_free_delivery_price`), narrows the establishments list.
- [2026-08-27 — Drop "Ближайшие", move "Заведения" below the carousel](2026-08-27-remove-near-filter-move-pubs-below-carousel.md)
  — the sort carousel is Хиты/Со скидкой only now; the Заведения chip is its own row
  under the carousel instead of sharing it behind a divider.
- [2026-08-26 — Remove the section switcher from Home](2026-08-26-remove-home-section-switcher.md)
  — the Еда/Цветы/Продукты pill row is gone from AppHeader; section is chosen once on
  SectionPickerPage, back arrow leads there. SectionSwitcher.jsx deleted (orphaned).
- [2026-08-26 — Fix: two popups open at once](2026-08-26-popup-mutual-exclusion.md)
  — `BottomSheet` now takes a required `id` and uses `usePopupExclusive` so opening a
  second popup always closes whatever was already open, instead of both showing stacked.
- [2026-08-26 — Home feed headline follows the selected filter](2026-08-26-top-dishes-headline-follows-filter.md)
  — "Хиты продаж" only shows for the Хиты filter; "Со скидкой" gets its own headline
  saying discounted items are shown; Ближайшие/Заведения show no headline.
- [2026-08-26 — Basket floating bar: safe-area fix + active-orders fallback](2026-08-26-basket-bar-safe-area-and-active-orders.md)
  — the Home floating bar no longer relies on inherited Wrapper padding for its absolute
  position (explicit inset + a 64px Android floor, same fix family as BottomSheet's);
  shows an "Активные заказы" pill instead of the basket bar when the basket is empty.
- [2026-08-26 — Push notifications: root cause + notifications history screen](2026-08-26-push-notifications-fix-and-history.md)
  — likely cause of "pushes partially don't work": Android push needs FCM V1 credentials
  since Google killed the legacy FCM API in June 2024, `eas.json` had the CLI's own setup
  prompt silenced (`promptToConfigurePushNotifications: false`, now removed), and a
  ready-to-upload Firebase service account key sits unused in the repo root — needs an
  interactive `eas credentials` run to actually fix (couldn't be driven from this
  sandbox). Also fixed a real bug (`subscribeNotificationTokenOnServer()` called with no
  args on every mount) and added Профиль → Дополнительные настройки → Уведомления, a
  local history of received pushes.
- [2026-08-26 (even later) — home controls swap reverted, discount price fixes, centered popups](2026-08-26-first-screen-controls-orders-safe-areas.md)
  — categories moved behind a button, Хиты/Со скидкой/Ближайшие/Заведения back as a
  visible carousel; `DishCard.jsx`'s duplicated (and buggy) discount math replaced with
  `getDishPrices`, old-price line added to the checkout review list; every popup
  (`BottomSheet.jsx`, used by all 9) now centers instead of anchoring to the bottom.
  Dated section inside the same file as the redesign it reverses.
- [2026-08-26 — Skip the section picker on a cold-start deep link](2026-08-26-skip-section-picker-on-deeplink.md)
  — `App.js` now resolves `Linking.useLinkingURL()` (synchronous, unlike `useURL()`)
  before `Stack.Navigator` mounts, so a pub/order link opens straight there instead of
  flashing the section picker first. Parsing + resolution logic deduped into
  `src/shared/utils/deepLink.js`, shared by `App.js`, `LinkingWathcer` and
  `useLinkedDestination`.
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
