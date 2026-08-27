# Home feed headline follows the selected filter

Date: 2026-08-26

## What & why

The "Хиты продаж" headline under the controls row used to be static text, shown no matter
which sort chip was active - so it kept saying "top sellers" even while the feed was
actually showing discounted dishes. Asked to make it honest: the headline only when "Хиты"
is selected, and a distinct headline telling the client they are looking at discounted
items when "Со скидкой" is selected.

## Files

### Modified

- `src/widgets/TopDishes/TopDishesList.jsx` — the `showTitle && (...)` block became
  `renderTitle()`: returns the existing "Хиты продаж" + section subtitle only for
  `topDishesFilters.top`, a new "Товары со скидкой" + subtitle for
  `topDishesFilters.deals`, and `null` for `near`/`pubs` (see below). Reads the immediate
  `filter` state, not the deferred one used to rebuild the feed, so the text updates on
  the tap itself rather than lagging behind with the grid.
- `assets/locales/{ru,ro,gz}.js` — `home_page.top_dishes.{deals_title,deals_subtitle}`.
  ro/gz are my own translations, not native-checked (same caveat as every other ro/gz
  addition in this repo).

## How it works

No new state: `renderTitle()` just branches on the `filter` value `TopDishesList` already
had (`useState(topDishesFilters.top)`), the same one `FiltersCarousel` reads to highlight
the active chip.

`near` and `pubs` were not part of the ask - only "show the headline for Хиты" and "show
discount text for Со скидкой" were - so both fall through to `null` (no headline) rather
than guessing new copy for them. `pubs` also swaps the whole header context to a list of
establishments already, where a dish-feed headline would not make sense anyway.

## Backend gaps

None.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` and a babel parse of the changed
  file; not opened on a device or in a simulator.
- If "Ближайшие" ever wants its own headline too, the same `renderTitle()` branch pattern
  extends directly - no restructuring needed, just another `if`.
