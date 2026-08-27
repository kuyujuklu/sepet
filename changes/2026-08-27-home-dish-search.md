# Dish search on the Home feed

Date: 2026-08-27

## What & why

The app had no search anywhere (flagged in an earlier UX pass this session). Asked for a
search entry point on Home, between "Со скидкой" and "Все рестораны": a recognizable icon
that expands into a full-width input covering the rest of the row on tap, with results
below in the same product-card format as the Хиты/Скидки feed.

Clarified with the client before building: search matches **dish name only**, and covers
**all nearby establishments**, not just the 8 whose full menus are already loaded for the
curated Хиты feed - loading the rest only once search is actually opened.

## Files

### Added

- `src/widgets/TopDishes/DishSearchInput.jsx` — the expanded state: a bordered pill
  (search icon + `TextInput`, autofocuses on mount, a "×" clear once there's text) plus a
  trailing "Отмена" button that exits search entirely. Rendered *instead of*
  `FiltersCarousel` while search is active - a swap, not an animated grow, since the ask
  was about covering the other buttons, not a transition.

### Modified

- `src/shared/utils/topDishes.js` — new `searchDishes(pubsWithMenus, { query, sectionId,
  categorySlugsById, limit })`. Reuses this file's existing private `isOrderableDish`/
  `getDishSlugs`/`slugsMatchSection` (and the pub section-override lookup used by
  `buildTopDishes`), so a match still respects "visible, priced" and the current section -
  verified a dish belonging to a section-overridden pub (see
  `changes/2026-08-27-pub-section-overrides.md`) only surfaces under its *overridden*
  section, never the one its raw category tag would have implied. Unlike `buildTopDishes`,
  no per-pub cap and no round-robin interleave - every match counts, from every pub. Sort:
  names that start with the query before names that just contain it.
- `src/widgets/TopDishes/useTopDishes.js` — `MAX_PUBS_TO_LOAD` (8) is now also exported;
  new `MAX_PUBS_FOR_SEARCH` (30). New params `searchQuery` and `maxPubs` (default
  `MAX_PUBS_TO_LOAD`). `nearbyPubs` slices to `maxPubs` instead of the old hardcoded
  constant; `dishes` runs `searchDishes` instead of `buildTopDishes` whenever `searchQuery`
  is non-empty. New `isSearching` in the return value.
- `src/widgets/TopDishes/TopDishesFilters.jsx` — `FiltersCarousel` takes a new optional
  `onSearchPress`; when given, renders a 40×40 circular `Ionicons name="search"` button
  between the Хиты/Со скидкой scroll and the pinned "Все X" chip (`accessibilityLabel` set
  for screen readers).
- `src/widgets/TopDishes/TopDishesList.jsx` — new `isSearchActive`/`searchQuery` state
  (query deferred with `useDeferredValue`, same pattern already used for category/filter).
  `useTopDishes` now receives `searchQuery`/`maxPubs` conditioned on `isSearchActive`, and
  `skip` changed from `isPubsView` to `isPubsView && !isSearchActive` (opening search while
  on "Все заведения" still needs dishes to search over). Three render-path changes: the
  `isPubsView` early return now excludes `isSearchActive` (search always shows dish cards,
  even if "Все X" was the active tab); a new early return shows a neutral prompt while
  search is open but nothing has been typed yet (otherwise the hook would just hand back
  the normal curated feed for an empty query); the shared empty-state text/actions and the
  "Хит" badge are both search-aware (no "show establishments"/"clear category" detours
  during search, no hit badges on search matches). Categories/free-delivery/sort row and
  the feed headline are both hidden while search is open.
- `assets/locales/{ru,ro,gz}.js` — `home_page.top_dishes.{search_placeholder,
  search_cancel,search_prompt,search_no_results,search_accessibility_label}`. ro/gz are my
  own translations, not native-checked, same caveat as every other ro/gz addition here.
- `src/shared/analytics/events.js` — `searchOpened`, tracked once when the icon is tapped.

## How it works

No new data-fetching machinery. `useTopDishes` already loaded full per-pub menus into a
`menus` state before turning them into a feed; `maxPubs` becoming reactive means the
existing menu-loading effect (completely unchanged) just picks up more pubs on its own once
`isSearchActive` flips `maxPubs` from 8 to 30 - the first 8 are already RTK-Query-cached
from the normal feed, so only the additional ones cost a real network request, and only
once. Deactivating search drops `maxPubs` back to 8 and the effect reruns again, shrinking
`menus` back down (all still warm in RTK Query's cache for next time).

`TopDishCard` already renders from a plain `{key, dish, pub}` item, which is exactly what
`searchDishes` returns - the existing `FlatList`/2-column grid in `TopDishesList.jsx`
needed no changes to render search results as product cards; it's the same render path,
fed different data.

## Backend gaps

None - everything search needed (dish names, per-pub menus, nearby-pub list) was already
returned by endpoints this screen already calls.

## Known limits / follow-ups

- Verified with `npx expo export --platform ios` (compiles) and a standalone Node script
  exercising `searchDishes` directly: a mid-word match, a no-match query, section filtering
  (including a section-overridden pub), and "starts with" ranking above "contains" all
  behaved as designed. Not opened on a device/simulator - the actual keyboard-autofocus
  timing (`setTimeout(..., 50)` in `DishSearchInput`) and the full-width swap animation
  feel are both things that really need eyes on a real screen.
- `MAX_PUBS_FOR_SEARCH = 30` is a deliberate ceiling, not "literally everywhere nearby" -
  in a very dense area with more than 30 delivering pubs, the search would not reach the
  furthest ones. Matches this app's existing accepted pattern of capping "how many pubs get
  their menu fetched" rather than truly paginating (see the Хиты feed's own `MAX_PUBS_TO_LOAD`
  and the backend gap already on record in `changes/2026-08-24-home-top-dishes.md` about
  there being no aggregated/paginated dish-search endpoint).
## 2026-08-27 (later) — real debounce + minimum query length

Client feedback: search was firing after 2-3 letters, before they'd finished typing.
Root cause was exactly the risk flagged above - `useDeferredValue` only deprioritizes a
render, it doesn't wait in real time, so every keystroke still eventually ran a search.

- Added `src/shared/hooks/useDebouncedValue.js` - generic `useState`/`setTimeout` debounce
  (holds the previous value until `value` stops changing for `delayMs`), replacing
  `useDeferredValue` for the search query in `TopDishesList.jsx`.
- `TopDishesList.jsx`: new constants `SEARCH_DEBOUNCE_MS = 900`, `MIN_SEARCH_QUERY_LENGTH = 4`.
  `debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS)`;
  `isSearchQueryReady = trimmedSearchQuery.length >= MIN_SEARCH_QUERY_LENGTH`. The
  `useTopDishes` call only passes a real query (and therefore only searches) once both
  conditions hold: `isSearchActive && isSearchQueryReady ? debouncedSearchQuery : ""`. The
  "type something" prompt state now also covers "typed something too short".
- Both fixes requested as alternatives ("задержку... или ограничение минимум 4 буквы") -
  did both, since together they cover both complaints: short queries (1-3 letters) never
  search at all, and a 4+ letter query still waits 900ms of typing silence before firing.
- Verified: `babel.parseSync` on both changed files, `npx expo export --platform ios`.
  Not opened on a device - the 900ms/4-char values are tunable if they feel off in hand.

## 2026-08-27 (even later) — dismiss the keyboard once results are in

Client feedback: after results appear, the keyboard should get out of the way if
possible. `TopDishesList.jsx` gained a `useEffect` that calls `Keyboard.dismiss()` once
the debounced/min-length query has actually settled into a shown state - either results
or a confirmed "nothing found" (`isSearchActive && isSearchQueryReady && !isLoading &&
!isUpdating`). It does not fire while still waiting on the debounce or the fetch, so it
won't yank the keyboard away mid-type. `TextInput` in `DishSearchInput.jsx` was not
touched - `Keyboard.dismiss()` blurs it regardless of which component holds focus, and
tapping back into the input still reopens the keyboard normally.
Verified with `babel.parseSync` + `npx expo export --platform ios`; not opened on a
device.
