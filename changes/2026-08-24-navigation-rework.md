# Navigation rework: no tab bar, shared top bar, captioned categories

Date: 2026-08-24

## What & why

The bottom tab bar and the new floating basket pill were competing for the same
corner of the screen, the categories carousel was pinned to the bottom only because
the bar was there, the address row was copy-pasted into two screens (and crashed on a
null location), and the category icons carried no text at all. The owner asked for:
captioned categories everywhere, no bottom bar, one shared address header, a home for
"all orders" + settings/language, and clean seams for analytics that will be added
later to analyse the customer journey for targeting.

Result: one top bar (address left, profile right), a Profile screen that absorbed the
whole tab-bar drawer, a captioned category carousel that filters the home feed in
place, and a vendor-agnostic analytics facade with no SDK installed.

## Files

### Added

- `src/widgets/AppHeader/AppHeader.jsx` — the single top bar. Props
  `{ title, showAddress = true, showBack = false, right }`; `right` defaults to the
  profile button, pass `null` to hide it. Null-guards the location
  (`[town, fullAddress].filter(Boolean).join(", ")` → `header.set_address`), which fixes
  a real crash: `Home` used to read `location.town` unguarded.
- `src/widgets/AppHeader/ProfileButton.jsx` — round emerald button → `Profile`. Drawn
  from two Views (head + shoulders); there is no person icon in `assets/images`.
- `src/pages/Profile/ProfilePage.jsx` — orders, change address, language, support
  (phone + Telegram), logout, delete account.
- `src/widgets/Profile/SwitchLanguage.jsx` — moved from `src/widgets/Navbar/`, body
  unchanged apart from a `language_changed` event.
- `src/widgets/FoodCategories/CategoriesCarousel/CategoryChip.jsx` — 56px circle icon
  with a caption under it; selected = emerald circle + bold emerald caption.
- `src/widgets/FoodCategories/CategoriesCarousel/CategoriesCarousel.jsx` — replaces
  `FoodCategoriesNavbar`. New `onSelect` prop; without it, it keeps the old
  navigate-to-category behaviour.
- `src/shared/utils/foodCategories.js` — the taxonomy (`placeholderCategories`,
  `placeholderAllCategory`, `categoryNamesArray`), `getCategoryTranslationKey`,
  `getCategoryCaptionKey`, `sortCategoryNames`. Previously the pages imported the
  taxonomy *from a widget file* and `translateFoodCategories` lived inside
  `FoodCategoriesPage`.
- `src/shared/hooks/useNearbyCategoryNames.js` — the near-identical blocks that Home and
  FoodCategoriesPage each had. Also returns `categorySlugsById`, which the feed filter needs.
- `src/shared/analytics/analytics.js`, `src/shared/analytics/events.js` — the facade
  (`track`, `trackScreen`, `setAnalyticsSink`) and the event catalogue.
- `src/features/store/analytics/analyticsMiddleware.js` — maps redux actions to events.

### Modified

- `App.js` — `Screens.Profile` + stack entry; `<Navbar/>` and `selectNavbarIsEnabled`
  gone; the empty `trackScreenView` stub replaced with `trackScreen`; the
  previous-route comparison moved from state to a ref (batched renders could skip a
  transition); the now-dead `routeName` state removed.
- `src/pages/Home/Home.jsx` — `AppHeader`, owns `selectedCategory`, basket pill offset
  from `useSafeAreaInsets`.
- `src/pages/FoodCategories/FoodCategoriesPage.jsx` — `AppHeader` + carousel at the top
  instead of a floating bottom bar; the duplicated address row and the `fontSize 32`
  title are gone; chips now call `navigator.setParams` instead of re-navigating to the
  screen they are already on (no flicker, no invisible back-stack of category hops).
- `src/pages/Wrapper.jsx` — no navbar padding, `paddingBottom: insets.bottom`.
- `src/pages/{Orders,Basket,PubInfo,CreateOrder}` — adopted `AppHeader showBack`.
  Orders lost its duplicated `fontSize 32` title (it was rendered twice).
- `src/widgets/TopDishes/{TopDishesList,useTopDishes}.jsx|js`,
  `src/shared/utils/topDishes.js` — category filtering (below).
- `src/widgets/Orders/OrdersList/OrderInfo.jsx:264` — the "support" pressable used to
  open the tab-bar drawer; now navigates to `Profile`.
- `src/shared/api/ordersApi/ordersApi.js` — `onQueryStarted` on `createOrder` emits
  `order_submitted` / `order_succeeded` / `order_failed`.
- `assets/locales/{ru,ro,gz}.js` — new `header.*`, `profile.*`,
  `home_page.top_dishes.{pubs_of_category,no_dishes_in_category,show_all_dishes}`,
  `categories.all`; plus the missing `categories.sales` in `gz`. ro/gz are my
  translations — not native-checked.
- Offsets that existed only to clear the bar are now `useSafeAreaInsets()`:
  `BasketPage`, `PubInfoPage`, `AlertWrapper` (toasts used to float ~80px above nothing),
  `TopDishesList` (120 → 96, now for the basket pill), `CategoryWithPubInfoList` (120 → 24).

### Removed

- `src/widgets/Navbar/` (whole directory) and `src/features/store/navbar/navbarSlice.js`
  plus all 11 `enableNavbar`/`disableNavbar`/`setNavbarExpanded` dispatch sites and the
  `<Wrapper style={{paddingBottom: 0}}>` overrides they paired with. The slice existed
  only to hide the bar and open its drawer; with the bar gone both fields are
  unobservable, and leaving them would look like a hidden invariant.
- `src/widgets/FoodCategories/CategoriesNavbar/` → renamed to `CategoriesCarousel/`;
  `CategoryNavbarImage.jsx` and `Underscore.jsx` deleted (the latter was filled with a
  literal `"blue"`).
- Dead code: `src/pages/Client/`, `src/pages/ClientPage/`, `src/widgets/Client/ClientInputs.jsx`
  (rendered the string "this is CLIENT PAGE"), `mixpanel_functions.js` (imported a package
  that is not in `package.json` and called `mixPanelInit()` at module scope).
- One pre-existing dead import: `selectNearGeolocationState` in `SelectGeolocationPage`
  (no such export in the slice).

## How it works

**Category filtering of the home feed.** A dish carries only `category_id`; the slugs
live on the category (`category_types`), which comes from `get-available-categories`.
So `useNearbyCategoryNames` builds `categorySlugsById`, `useTopDishes` passes it into
`buildTopDishes({ categorySlug, categorySlugsById })`, and `matchesCategory` keeps a
dish when its category's slugs contain the selected one. If that map has no entry for a
category, it falls back to the pub's own `categories` from the pub-info response — so if
that response does carry `category_types`, a gap in the nearby-categories payload
degrades to "fewer dishes" instead of "nothing". Verified against mock menus: both
paths, empty results, and `deals` + category composing correctly.

Under a category the per-pub cap rises from 4 to 8 (`MAX_DISHES_PER_PUB_IN_CATEGORY`) —
a kebab place would otherwise contribute 4 dishes to a kebab-filtered feed. Tapping the
active chip clears the filter. The feed scrolls back to the top on every filter change.

**Analytics.** Nothing is sent anywhere yet: the sink is a console logger in `__DEV__`
and a no-op otherwise. Wiring a vendor later is `setAnalyticsSink(fn)` once at startup —
no screen has to be touched. Basket events come from the redux middleware rather than
the components, because `increaseDish` is dispatched from three different surfaces
(feed card, dish list, dish popup) and one seam covers all of them. Order events sit in
RTK Query's `onQueryStarted`. No PII in any event (no phone, no full address).

## Backend gaps

1. `missing data` — **no localized category names or icons from the server.** The 17
   slugs, their captions and their PNGs are hardcoded in the client
   (`src/shared/utils/foodCategories.js` + `categories.*` in three locale files). A new
   `category_type` added on the backend silently disappears from the carousel. Wanted:
   `GET /api/client/category-types` → `[{ slug, name_ru, name_ro, name_gz, icon_url, priority }]`.
   That would delete `placeholderCategories`, `getCategoryTranslationKey` and the whole
   `categories.*` locale block.
2. `missing data` — **no `category_types` on a dish** (and unverified whether pub-info
   categories carry them). The feed has to join dish → category → slugs through a second
   endpoint. Wanted: `category_types` (or a flat `category_type`) on the dish.
3. `API change needed` — **no server-side category filter.** Filtering happens client-side
   over at most 8 downloaded menus, so a niche category can look emptier on Home than on
   the categories screen. The aggregated endpoint asked for in
   `2026-08-24-home-top-dishes.md` should also take `&category=<slug>`.
4. `missing data` — **no stable client id.** `selectClient` is `{ phone, name, isGuest }`.
   Analytics identity would have to key on the phone number, which is PII. Until the
   backend returns an id, a client-side install id in AsyncStorage is the stand-in — not
   implemented yet, so the funnel cannot be stitched across sessions.
5. `missing data` — **no consent record.** There is a privacy-policy link at registration
   but no stored acceptance, no policy version, no opt-out. `setAnalyticsSink` is the
   kill-switch seam; the stored flag and a toggle on the Profile screen are follow-ups.
6. `API change needed` — **no server-side order events / no `source` on an order**, so
   client-reported funnels cannot be corroborated, which is exactly what targeting needs.
7. `missing data` — **no active-order flag** (`has_active_order` or
   `GET /api/client/orders?status=active`). Orders no longer have a permanent tab, so a
   badge on the profile button is the natural replacement — impossible without it.
8. `missing data` — **no server-side address book** (saved addresses live only in
   AsyncStorage) and **no address label** (`Дом` / `Работа`), which is what the header
   should really show instead of a truncated street line.
9. `API change needed` — support phone and Telegram are hardcoded in `ProfilePage`.
   Wanted: an app-settings endpoint so they can change without a store release.
10. Still open from `2026-08-24-home-top-dishes.md`: no dish popularity counter, no
    aggregated top-dishes endpoint, no stop-list flag, no image thumbnails, no `distance`
    on pub-info.

## Fixed after the first device screenshot

The carousel rendered as a pile of overlapping icons. Cause: **in native-base a bare
number on a size/space prop is a scale token, not pixels** — and only for values that
exist in the scale. `width={72}` on the chip resolved to 72 * 4 = 288px, so every chip
was as wide as the screen while `getItemLayout` advanced the list by 80px; chips 2..N
were pushed off-screen and only the "all" one (the 2x2 collage icon) stayed visible.
`height={28}` on the caption survived only because 28 is *not* in the scale and passed
through raw - which is exactly why the trap is hard to spot.

Fixes:
- `CategoryChip` and `CategoriesCarousel` now use plain react-native `StyleSheet`
  values for all geometry; the carousel has an explicit `width: "100%"` and
  `height: 94`, because it sits inside the header of another list and cannot size
  itself from its content. The chip's selection scale animation was dropped - colour
  alone carries the state and it is one less moving part.
- `TopDishesList` row separator was `height={12}` → token 12 = **48px**, which is why
  the gap between card rows looked too big. Now a `style={{ height: 12 }}`.

Rule of thumb for this repo: use `style={{ ... }}` for pixel geometry in native-base
components, and reserve the numeric props for the scale (`w={10}` = 40px).

## Fixed: 2s freeze when tapping a category chip

Tapping a chip set state urgently, so the tap could not repaint until the whole feed
had been rebuilt: `buildTopDishes` over 8 full menus, then up to 40 cards remounted,
each mounting a **full-size** remote dish photo (the backend has no thumbnails - gap
#10 / `2026-08-24-home-top-dishes.md` #4). The FlatList had no virtualization tuning,
so all 40 rendered at once instead of the first screen.

- `TopDishesList` now takes `useDeferredValue` of the category and the filter (React 19
  is already a dependency): the chip highlights immediately from the urgent state, the
  feed rebuilds from the deferred one, and the list is dimmed to 0.5 while stale.
  Note the empty-state text and the "хит" badge read the **deferred** values - they
  must describe what is actually on screen.
- Virtualization: `initialNumToRender={6}`, `maxToRenderPerBatch={4}`,
  `updateCellsBatchingPeriod={50}`, `windowSize={7}`. `removeClippedSubviews` was
  deliberately not enabled - it is known to blank cells with `numColumns`.
- `TopDishCard` images got `recyclingKey`, `cachePolicy="memory-disk"` and a short
  transition, so dishes that survive a filter change are not decoded again.

Not profiled on a device - the causes above are structural, but if a stall remains, the
next suspect is the per-card `elevation` shadow on Android, and the real fix for the
image cost is a thumbnail URL from the backend.

## Known limits / follow-ups

- **Not run on a device.** Only babel parse checks and node tests of the pure feed logic.
  Needs manual QA: back navigation on both platforms (the tab bar was the de facto way
  out of Basket/Orders/PubInfo), safe-area offsets on a notched iPhone and Android
  gesture nav, ro/gz caption wrapping in the chips (fixed 28px caption box, 2 lines),
  guest mode on the Profile screen, and the deep-link paths through the auth forms whose
  `enableNavbar()` calls were removed.
- The category icons are still a mixed 256/512px set with inconsistent styling; the
  uniform circle hides most of it. A proper icon re-cut is a design task.
- Android hardware back on Home now exits the app; `initialRouteName` is
  `SelectGeolocationPage`, so confirm back does not land in the address picker.
- The empty-category state does not offer "dishes from other categories" — deliberate;
  a padded feed makes the filter look broken.
