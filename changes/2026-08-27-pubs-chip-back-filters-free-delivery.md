# "Все рестораны/цветочные/продуктовые" back in the carousel, Фильтровать moves below, free-delivery filter

Date: 2026-08-27

## What & why

Three related asks about the Home controls, on the heels of yesterday's carousel rework:

1. The establishments chip goes back into the sort carousel - but instead of the generic
   "Заведения" it had before, it now reads section-specific: "Все рестораны" (food), "Все
   цветочные" (flowers), "Все продуктовые" (groceries).
2. The categories button (`CategoriesButton`, labelled "Категории") moves out of the row
   next to the carousel and sits in its own row underneath - back to where the pubs chip
   used to sit yesterday. Renamed "Фильтровать", because it does more than categories now:
3. A new filter inside that sheet: "Бесплатная доставка" - narrows the establishments list
   to pubs that waive delivery above some order total.

## Files

### Added

- `src/widgets/TopDishes/FiltersButton.jsx` — replaces
  `src/widgets/FoodCategories/CategoriesButton.jsx` (deleted, moved+renamed here since its
  job is no longer category-only). Default label "Фильтровать"; shows the selected
  category's caption if one is picked, else "Бесплатная доставка" if that filter is on
  instead. `alignSelf: "flex-start"` added to its pill style - it no longer shares a row
  with the carousel (see below), and a lone child of a plain column `View` stretches to
  fill the row's width in React Native unless told not to.
- `src/widgets/TopDishes/FiltersSheet.jsx` — replaces
  `src/widgets/FoodCategories/CategoriesSheet.jsx` (deleted, moved+renamed). Same category
  grid as before, plus a "Доставка" group underneath with one toggle row: "Бесплатная
  доставка", checkmark when active, same visual language the old two-group `FiltersSheet`
  (from `changes/2026-08-26-first-screen-controls-orders-safe-areas.md`, since replaced by
  the carousel) used for its rows.

### Removed

- `src/widgets/FoodCategories/CategoriesButton.jsx`, `CategoriesSheet.jsx` — superseded by
  the two files above.
- `src/widgets/TopDishes/TopDishesFilters.jsx`'s `PubsFilterButton` export (yesterday's
  standalone below-carousel button) - the pubs chip is back inside `FiltersCarousel`
  itself, see below.

### Modified

- `src/widgets/TopDishes/TopDishesFilters.jsx` — `Chip` now takes a resolved `label`
  string instead of a `labelKey` it translates itself, so the pubs chip can be given a
  dynamic, section-specific string. `FiltersCarousel` grew back a `pubsLabel`/
  `showPubsFilter` pair and renders the pubs chip (divider + chip, same as the original
  08-25 design) when both are truthy.
- `src/widgets/TopDishes/TopDishesList.jsx` — `pubsLabel = t(getSectionPubsLabelKey(sectionId))`
  passed into the carousel. `showCategoriesButton` prop renamed `showFiltersButton`
  (no external caller passed it by name, so this is a same-behavior rename). New
  `freeDeliveryOnly` state; `changeFilter` (any direct chip/button tap) resets it, a
  separate `toggleFreeDelivery` does not - see "How it works". `listHeader` is now two
  full-width rows (carousel, then the filters button) instead of one row split between
  the carousel and the button. `PubsList` gets `freeDeliveryOnly` passed through.
- `src/widgets/Pub/PubsList.jsx` — new `freeDeliveryOnly` prop; the pub filter gained one
  more condition, `+pub?.shipping_free_delivery_price > 0`, the same field
  `BasketSummary`/`PubCard` already read to show "Бесплатная доставка от X" badges/hints.
- `src/shared/utils/sections.js` — `getSectionPubsLabelKey(sectionId)` →
  `sections.<id>.all_pubs_label`, alongside the existing `getSectionTitleKey` etc.
- `assets/locales/{ru,ro,gz}.js` — `sections.{food,flowers,groceries}.all_pubs_label`;
  `home_page.top_dishes.{filters_button,filters_sheet_subtitle,filters_delivery_group,
  filter_free_delivery}`; removed the now-orphaned `categories.sheet_subtitle` (confirmed
  no other reader before deleting - `categories.sheet_title` stays, `PubInfoPage` and
  `CategoriesCarousel`'s "Ещё" chip still use it independently). ro/gz strings are my own
  translations, not native-checked, same caveat as every other ro/gz addition here.

## How it works

**Section-aware label, not built from the section title.** "Все " + "Еда" is not a real
Russian phrase, so each section carries its own full label
(`sections.food.all_pubs_label = "Все рестораны"`) rather than composing one from
`getSectionTitleKey`.

**Free delivery is a pub attribute, so selecting it always means "show pubs."**
`toggleFreeDelivery` sets `filter` to `PUBS_FILTER` whenever it turns the flag *on* -
narrowing something only makes sense in the view it narrows. It deliberately does **not**
route through `changeFilter`, because `changeFilter` resets `freeDeliveryOnly` on every
call (any direct tap on a sort chip, the pubs chip, or the empty-state "show
establishments" button is a fresh, explicit choice, and a filter left over from the sheet
should not silently keep narrowing a view the client did not ask to narrow again).
Conversely, turning the flag back *off* from inside the sheet does not force `filter` back
to anything - the client stays looking at establishments, just unfiltered by delivery.

**Category and free-delivery are combinable.** Both thread into the same `pubs` `useMemo`
in `PubsList` independently - a category slug and free-delivery can both be active
(cake shops with free delivery), matching how category + establishments view already
combined before this change.

## Backend gaps

None - `shipping_free_delivery_price` was already returned by `get-nearby-pubs` and
already used elsewhere in the app (basket/checkout "до бесплатной доставки не хватает X",
the pub card badge); this only reads it in one more place.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles - confirms nothing still
  imports the two deleted files) and reading every touched file back; not opened on a
  device or simulator.
- The empty-state "show establishments" button inside the dish grid (`listEmpty`) still
  says the generic `filter_pubs` ("Заведения"), not the section-specific label - left as is
  since it is a call-to-action button text, not a carousel chip, and changing it was not
  part of the ask.
- No dev-time check that a pub with `shipping_free_delivery_price` unset vs. explicitly `0`
  are told apart - both read as "no free delivery" here (`+value > 0`), which matches how
  `PubCard`/`Pub` already treat the same field elsewhere in the app.
