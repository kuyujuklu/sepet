# "Все X" pinned outside the scroll, Фильтровать/Сортировать only for establishments, new sort order

Date: 2026-08-27

## What & why

Three related changes to the Home controls, on top of yesterday's carousel/filters work:

1. The section-aware "Все рестораны/цветочные/продуктовые" chip moves out of the
   scrollable Хиты/Со скидкой row into a fixed element pinned to the right - it is a view
   switch, not a sort of the same feed, so it should never be one swipe away from
   disappearing off-screen.
2. The "Фильтровать" row underneath the carousel now shows only while the establishments
   view ("Все X") is active - categories and free-delivery are questions about *which
   places* to show, so they were doing nothing useful while browsing Хиты/Со скидкой.
3. New "Сортировать" button, next to Фильтровать, establishments-only: По рейтингу
   (default), По расстоянию, По скорости доставки (the pub's `shipping_time_to` - the
   upper bound of its own delivery estimate, ascending).

## Files

### Added

- `src/widgets/TopDishes/SortButton.jsx` — same pill shape as `FiltersButton`, but
  white/bordered (secondary) rather than solid green, so two green pills side by side
  don't read as the same kind of action. Default label "Сортировать"; shows the active
  sort's label once it is not the default.
- `src/widgets/TopDishes/SortSheet.jsx` — single-select list (По рейтингу/По расстоянию/По
  скорости доставки), same row/checkmark visual language as `FiltersSheet`'s free-delivery
  row. Always exactly one selected, unlike that sheet's toggle.

### Modified

- `src/widgets/TopDishes/TopDishesFilters.jsx` — `FiltersCarousel` is now a row: a
  `ScrollView` (`flex: 1`) holding only Хиты/Со скидкой, and the pubs chip as a plain
  sibling `Chip` outside it, right-aligned by the row's own layout. Dropped the divider
  that used to separate it inside the scroll - no longer needed once it is visually
  separated by being outside the scroll area entirely.
- `src/widgets/Pub/PubsList.jsx` — new `pubsSortOptions` (`rating`/`distance`/`speed`) and
  `defaultPubsSort` (`rating`), exported for the button/sheet above to share. New `sortBy`
  prop; the pub list's `useMemo` sorts by the picked comparator first, then still applies
  the existing open-pubs-first pass last (unchanged - closed pubs always sink to the
  bottom no matter which order is picked, verified against a small hand-built pub list:
  `rating`/`distance`/`speed` each produced the expected order, and a closed pub with the
  best raw score under every metric still sorted last in each of the three).
- `src/widgets/TopDishes/TopDishesList.jsx` — the `FiltersButton`+`SortButton` row now
  renders only when `showFiltersButton && isPubsView` (was `showFiltersButton` alone). New
  `pubsSort` state (`useState(defaultPubsSort)`) and `isSortOpened` state; `SortSheet`
  added to the shared `sheets` fragment; `sortBy={pubsSort}` passed into `<PubsList>`.
- `assets/locales/{ru,ro,gz}.js` — `home_page.top_dishes.{sort_button,sort_sheet_title,
  sort_rating,sort_distance,sort_speed}`. ro/gz are my own translations, not
  native-checked, same caveat as every other ro/gz addition here.

## How it works

No new data source - `pub.rating`, `pub.distance` and `pub.shipping.shipping_time_to` were
already present and already displayed on `PubCard` (rating badge, distance/time meta row);
this only adds a way to sort by them. Missing values sort to the end regardless of
direction (`|| 0` for rating descending, `|| Infinity` for distance/speed ascending)
instead of landing unpredictably wherever a `NaN` comparison happens to put them.

Category and free-delivery filtering still work exactly as before when the establishments
view is active - only their *visibility* changed (hidden while browsing dishes), not their
behavior.

## Backend gaps

None - `rating`/`distance`/`shipping_time_to` were already returned by the pubs endpoints
this screen already calls.

## Known limits / follow-ups

- Verified with `npx expo export --platform ios` (compiles) and a standalone comparator
  test against hand-built pub data (see above); not opened on a device.
- `pub.rating` with no reviews yet reads as 0 and sorts to the bottom under "По рейтингу" -
  same as an established place with a genuinely bad rating would. No way to tell the two
  apart client-side without a review-count field, which the API does not send.
