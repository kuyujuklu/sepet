# Drop "Ближайшие", move "Заведения" below the carousel

Date: 2026-08-27

## What & why

Two changes to the Home controls row: the "Ближайшие" sort chip is gone, and "Заведения"
moves out of the same scrollable row into its own row underneath - back to how it sat
before the two got merged into one carousel.

## Files

### Modified

- `src/shared/utils/topDishes.js` — `topDishesFilters` dropped `near`; `buildTopDishes`
  dropped the `if (filter === topDishesFilters.near) feed.sort(...)` branch, now dead
  since nothing in the UI can set `filter` to `near` any more.
- `src/widgets/TopDishes/TopDishesFilters.jsx` — `dishFilters` is just Хиты/Со скидкой now.
  `FiltersCarousel` lost its `showPubsFilter` prop and the divider + pubs-chip it used to
  render inline. The shared pill rendering was pulled into a small internal `Chip`
  component so a new export, `PubsFilterButton`, can render the exact same look as a
  standalone element.
- `src/widgets/TopDishes/TopDishesList.jsx` — `listHeader` now renders `PubsFilterButton`
  in its own row directly under `controlsRow` (gated on the existing `showPubsFilter`
  prop), instead of passing `showPubsFilter` into `FiltersCarousel`.
- `assets/locales/{ru,ro,gz}.js` — removed `home_page.top_dishes.filter_near`, the only
  place that string was read (confirmed with a repo-wide grep before deleting).

## How it works

No new state - `PubsFilterButton` takes the same `isSelected`/`onPress` shape the carousel
chip had, wired to the exact same `isPubsView`/`changeFilter(PUBS_FILTER)` `TopDishesList`
already tracked. The visual language (white/bordered, green when selected) is identical to
before; only its position moved from inside the scrollable row to a fixed row beneath it,
and it is no longer preceded by a divider since it isn't sharing a row with anything.

## Backend gaps

None.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` and a babel parse of every changed
  file (including the three locale files, to catch a stray comma from the key removal);
  not opened on a device.
- `distance` is still computed and attached to every feed item in `topDishes.js` (used by
  `TopDishCard` to show "pub · distance") - only the *sort-by-distance* behavior was
  removed, not the distance data itself.
