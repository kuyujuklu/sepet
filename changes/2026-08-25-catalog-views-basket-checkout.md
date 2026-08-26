# Catalog views, loaders, basket rework, checkout redesign

Date: 2026-08-25

## What & why

Follow-up to `2026-08-25-sections-and-soft-location.md`, five things in one pass:

1. The "all pubs" screen showed a directory of category cards while the start screen
   showed orderable dish cards — now it shows the **same dish cards**, with a switch to
   the establishments view.
2. **More than one way to read a list.** Opening a pub used to mean "tap a category →
   see its dishes → go back → tap the next one". There is a second mode now: the whole
   menu on one screen, a category heading with its dishes right under it.
3. **Loaders.** Every list that waits for the network now shows a skeleton of itself
   instead of blank space or a bare spinner.
4. **Bug: the basket pill never appeared on the "all pubs" screen** (nor inside a pub),
   so a dish added there led nowhere. There is no tab bar any more, so the pill is the
   only way in.
5. **Basket rework** — subtotal, add-more button, confirmation before a position is
   removed, and the rest of what a basket has to have — and a **checkout redesigned**
   for the flow where the address is typed here rather than at startup.

## Files

### Added

- `src/widgets/Skeletons/Skeleton.jsx` — the loading vocabulary of the app: a pulsing
  `Skeleton` block plus `DishCardSkeleton` / `DishGridSkeleton` (feed), `RowSkeleton` /
  `RowsSkeleton` (basket lines, menu rows) and `BigCardSkeleton` / `BigCardsSkeleton`
  (pub and category cards). One `Animated.loop` per block, native driver, stopped on
  unmount.
- `src/shared/utils/basket.js` — the money math of the basket in one place:
  `getBasketCount`, `getBasketItemsPrice`, `getBasketItemPrice`, `getDeliveryPrice`,
  `getAmountLeftForFreeDelivery`.
- `src/widgets/Common/ViewModeSwitch.jsx` — the small segmented control used by both
  screens that have view modes.
- `src/widgets/Menu/FullMenuList.jsx` — the "whole menu on one screen" view: a
  `SectionList` with a sticky category heading and `DishRow`s below it.
- `src/widgets/Dish/DishRow.jsx` — compact dish row (thumb, name, ingredients, price,
  add/stepper). The grid card is for the feed; a long menu reads better as rows.
- `src/widgets/Basket/BasketItemRow.jsx` — one basket position: thumbnail, unit price,
  stepper, line total, crossed-out old total when the dish is on sale.
- `src/widgets/Basket/BasketSummary.jsx` — subtotal / delivery / total card plus the
  "X left for free delivery" nudge with a progress bar.
- `src/widgets/Basket/RemoveDishPopup.jsx` — bottom-sheet confirmation before the last
  unit of a position leaves the basket. Global popup, mounted in `App.js`.

### Modified

- `src/pages/FoodCategories/FoodCategoriesPage.jsx` — dish grid by default
  (`TopDishesList` with the page's own title/carousel suppressed), a `ViewModeSwitch`
  to the establishments list, and the missing `BasketFloatingBar`.
- `src/widgets/TopDishes/TopDishesList.jsx` — new props `showTitle`, `showCarousel`,
  `showPubsLink`, `paddingBottom` so the feed can be embedded in another screen; the
  loading state is a `DishGridSkeleton` instead of a spinner; the empty-state "all pubs"
  button is hidden when the screen already *is* the pubs screen.
- `src/pages/PubInfo/PubInfoPage.jsx` — the categories/full-menu switch, the floating
  basket bar above the menu tabs, the pub name in the header, and
  `createNativeStackNavigator()` moved to module scope (it was re-created on every
  render, which threw the nested navigator away on each state change).
- `src/widgets/FoodCategories/CategoriesList/CategoryWithPubInfoList.jsx`,
  `CategoriesList/CategoryList.jsx`, `src/widgets/Dish/DishListForCategory.jsx`,
  `DishList.jsx` — skeletons while loading, an explicit empty state, and bottom padding
  that clears the floating bar.
- `src/pages/Basket/BasketPage.jsx` — rewritten (see below).
- `src/widgets/Basket/BasketCreateOrderButton.jsx` — plain-RN button showing the total,
  guards unchanged, emits `checkout_opened`.
- `src/widgets/Basket/BasketFloatingBar.jsx` — uses the shared basket math instead of
  its own copy of it.
- `src/features/store/basket/basketSlice.js` — `removeDishPopup` state with
  `openRemoveDishPopup` / `closeRemoveDishPopup` / `removeDish`;
  `openClearBasketPopup` now takes the texts in its payload so the same popup can ask
  "empty the whole basket?"; `doClearPopupConfirmingAction` resets `pubID` when there is
  no pending action (it used to leave the basket bound to a pub it had just emptied).
- `src/widgets/Orders/CreateOrder/CreateOrder.jsx` — rewritten (see below).
- `src/widgets/Orders/CreateOrder/CreateOrderInputs/CreateOrderInputs.jsx` — a `section`
  prop (`address` | `phones` | `comments`); no prop keeps the old all-in-one block.
- `src/pages/CreateOrder/CreateOrderPage.jsx` — computes the same numbers through
  `shared/utils/basket`, passes the order lines down, shows a skeleton while pub-info
  loads.
- `src/shared/analytics/events.js` — `checkout_opened`, `basket_cleared`,
  `view_mode_changed`.
- `App.js` — mounts `RemoveDishPopup`.
- `assets/locales/{ru,ro,gz}.js` — `view_modes.*`, the new `basket_page.*` keys,
  `pub_info_page.{empty_menu,dishes_count}`, `near_categories_page.nothing_found`,
  `create_order_page.{address,contacts,comment,order}.*` and two checkout alerts.
  **ro/gz are my translations and need a native check.**

## How it works

**Two views of a catalog.** `ViewModeSwitch` is local state on both screens, never a
route param: it is a way of looking at the data, not a place, and it must not end up in
the back stack. On "all pubs" the modes are dishes / establishments; inside a pub they
are categories / whole menu. The mode is reported as `view_mode_changed`, so it is
possible to see later which one people actually use.

`FullMenuList` builds its sections from `pubData.categories` filtered by the selected
menu, with `pubData.dishes` grouped by `category_id`; a category with no visible dish is
dropped, because a sticky heading over nothing is worse than no heading.

**Loaders.** The rule applied everywhere: while the data is missing, render the *shape*
of what is coming. The feed shows a grid of card skeletons with the real header above
it, the pub lists show three big-card skeletons, the basket and the menu show rows. The
distinction that matters in the basket: an empty dish list while the basket is *not*
empty means "pub-info has not arrived yet", not "your basket is empty" — the old screen
rendered the empty state in that gap.

**The basket.** One `getBasketItemsPrice` is now used by the floating bar, the basket
and the checkout; the delivery-service commission is rounded up **per line**, so summing
first and rounding later gives a different total — that was the drift between the three
copies. `getDeliveryPrice` returns `null` when the pub is not in the nearby list (which
also means "does not deliver here"), and the summary prints `—` rather than a made-up
zero.

What the screen has now: the pub it belongs to (with a link into its menu), one row per
position with a line total, subtotal / delivery / total, the "X left for free delivery"
progress, an "add more" button back into the pub, a clear-basket action in the header,
warnings when the pub is closed or out of range, an empty state with a way out, and the
submit button carrying the total.

**Removing a position.** `decreaseDish` at count 1 used to delete the line silently. The
basket row now dispatches `openRemoveDishPopup` instead and the deletion happens in
`removeDish` after a confirmation. The stepper on the *cards* (feed, menu rows) keeps the
old silent behaviour on purpose: there the dish visibly stays on screen, nothing is lost.

**Checkout.** Rebuilt as the same white-cards-on-grey language as the section picker:
"куда доставить" (with the approximate-location banner, the last three saved addresses
as one-tap fills, and the two address fields), "контакты", "оплата" as two selectable
rows instead of the old pill radio, "комментарий", and "ваш заказ" with the lines, the
delivery time and the summary. The submit button is sticky and shows the total; when the
form is invalid it stays tappable and explains what is missing rather than being dead.

## Backend gaps

- `missing data` — **no stop-list / availability per dish.** A dish that is out of stock
  looks exactly like an available one, and the client only finds out after the order is
  placed. Needed: `available` (or `stop_list_until`) on the dish, and ideally a
  validation endpoint for the basket before checkout. Already noted in
  `2026-08-24-home-top-dishes.md`; the basket rework makes it more visible, because the
  basket now presents itself as a confirmed order summary.
- `missing data` — **no minimum order sum.** The pub only sends
  `shipping_free_delivery_price` and `shipping_price`, so the basket can show progress
  towards free delivery but cannot say "minimum order 150 lei"; an order below the real
  minimum is rejected server-side with a generic error. Needed:
  `shipping_min_order_price` on the nearby-pubs entry.
- `API change needed` — **the delivery price is only in `get-nearby-pubs`, not in
  pub-info.** Every screen that shows money therefore has to hold two responses at once,
  and when the pub is missing from the nearby list the price is simply unknown. Needed:
  `shipping_price` / `shipping_free_delivery_price` (and the delivery flag) on the pub
  of `/api/client/pub/id/{id}` as well.
- `missing data` — **prices are not recalculated server-side before the order.** The
  client computes items + commission + delivery on its own and posts `deliveryPrice`;
  nothing checks that the server agrees. Needed: a `POST /orders/preview` returning the
  authoritative totals for a basket, which the checkout would display instead of its own
  arithmetic.
- `missing data` — categories have no `place`/order field, so the whole-menu view lists
  them in whatever order the API returns them; the pub cannot control what comes first.
- Still open from earlier notes: no dish popularity counter, no aggregated top-dishes
  endpoint, no server category dictionary, no section field on a pub, no reverse
  geocoding.

## Known limits / follow-ups

- The dish grid on the "all pubs" screen is the *nearby feed* filtered by the category,
  not "everything this category has": it is capped per pub (`MAX_DISHES_PER_PUB*`) and by
  `limit`, and it only covers the 8 closest pubs (`MAX_PUBS_TO_LOAD` in `useTopDishes`).
  A real catalog needs a server-side search/listing endpoint.
- The whole-menu view renders one `SectionList` over the entire menu. Menus here are a
  few dozen dishes, so it is fine; a several-hundred-dish menu would need windowing
  tuning or lazy sections.
- `DishCard` (the big card used by the category → dishes flow) was left alone. It is now
  the only surface with the old design; if the categories view stays, that card should be
  brought to the same language as `DishRow` / `TopDishCard`.
- The confirmation popup only guards the basket screen. Removing the last unit from a
  feed card or a menu row still happens silently — deliberate, but worth re-checking with
  real users.
- `getDeliveryPrice` switched from `>` to `>=` on the free-delivery threshold: an order
  exactly at the threshold now gets free delivery. That matches how the number is
  advertised ("бесплатная доставка от X").
- Nothing was run on a device. Verification was static: 162 files parsed with babel
  (`npm run lint` is broken repo-wide), every relative import resolved, all new locale
  keys checked in all three files, and `shared/utils/basket.js` covered by a throwaway
  node test (13 assertions: per-line commission rounding, the free-delivery threshold in
  both directions, the unknown-delivery case). Worth a manual pass: add from the "all
  pubs" screen and check the pill appears, both pub view modes, the remove confirmation,
  a full order from an approximate location, and the checkout on a small screen with the
  keyboard open.

---

## 2026-08-25 (later the same day) — follow-up round

Six fixes on top of the above, from a pass over the built screens.

### 1. The basket's submit button was rendered at the top of the screen

`styles.bottomBar` had `position: absolute` with `left/right` but **no `bottom`** — the
inline `{ bottom: 0 }` had been dropped together with the safe-area override earlier in
the session. An absolute box without `bottom` falls back to the top of the parent, so the
button sat over the header and covered the back button. `bottom: 0` restored, plus a
hairline top border so the bar reads as a bar. The same border was added to the checkout
bar, which was already positioned correctly.

### 2. Establishments live on the home screen now

The filter row is `Хиты · Со скидкой · Ближайшие │ Заведения`. The last chip is
separated by a divider because it is not a sort order: it swaps the dish grid for the
list of places **on the same screen** — no navigation, the header, the carousel and the
section switcher all stay where they are. `PUBS_FILTER` is exported from
`TopDishesFilters` and deliberately kept out of `topDishesFilters` in
`shared/utils/topDishes.js`, which stays a pure feed-sorting enum.

- Added `src/widgets/Pub/PubCard.jsx` — a real establishment card (16:9 photo, rating
  badge, free-delivery badge, closed veil with working hours, meta row with delivery
  time / price / distance) and `src/widgets/Pub/PubsList.jsx` — the list itself, which
  filters by section and category slug through the nearby-categories join and sorts
  open-first, then by distance.
- Added `pubMatchesSection(categoriesOfPub, sectionId)` to `shared/utils/sections.js`.
  It is **`some`, not `every`**: a place selling both food and bouquets belongs to both
  sections, and a pub whose categories are not loaded yet counts as untagged.
- Removed `CategoryWithPubInfoList.jsx` and `CategoryCardWithPubInfo.jsx` — `PubsList`
  replaces both. The old card was a category card wearing pub information; the client is
  choosing a place, so the card is now about the place.
- `TopDishesList` lost its `showPubsLink` prop and the "Все рестораны →" link with it:
  the chip does that job and does not redirect. The empty-state button switches to the
  same chip instead of navigating.

### 3. Inside a pub: no menu tabs, everything on one screen

- `MenuListForPub`, `MenuList` and `MenuItem` deleted. The menus of a pub are not gone:
  `FullMenuList` now walks **all** visible menus (ordered by `place`) and prints the menu
  name above the first category of each, so a pub with "Кухня" + "Бар" still reads
  correctly in one scroll.
- `CategoryList` used to bail out (`if (!menuID) return;`) when no menu was selected —
  with the tabs gone that meant an empty screen. It shows every visible category when no
  menu is given.
- The view switch is now `Списком` (default) / `По категориям`, full width and
  finger-sized (`ViewModeSwitch` rewritten: flex options, 15px labels, 11px vertical
  padding, screen gutter margins).

### 4. Pub information moved into a button next to the name

`PubInfoHeader` — a block of address/phone/extra info pinned above every list inside the
pub, eating the first screen of the menu — is deleted. `AppHeader` got a `titleRight`
slot; `PubInfoPage` puts a round `i` button there next to the pub name, opening the new
`src/widgets/Pub/PubInfoPopup.jsx` (name, rating, open/closed + working hours, address,
tappable phone, delivery time, additional info).

### 5. Edge paddings

`src/constants/layout.js` (`SCREEN_PADDING = 16`, `CARD_GAP = 12`) is now the single
gutter, applied to the feed title, the filter row, the carousel, both pub lists, the dish
lists inside a pub (were 10), the full menu (was 12), the basket, the checkout, the
section picker and the city picker (were 20). The left edge of a heading now lines up
with the left edge of the cards under it on every screen.

`DishList` and `CategoryList` also got `flex: 1` on their `SafeAreaView` — without it the
lists could not scroll to their end inside a screen — and `DishList`'s dead
`upperElement` prop was removed.

### 6. New locale keys

`home_page.top_dishes.filter_pubs`, `view_modes.as_list`, `view_modes.by_categories`
(replacing `view_modes.categories` / `full_menu`), `pub_info_page.{is_open,phone,close}`.
All three files; ro/gz still need a native check.

### 7. `FoodCategories` deleted

Once Home showed the establishments inline and its carousel filtered in place, that
screen had no entry point left and duplicated the home screen. Removed:

- `src/pages/FoodCategories/` (the page), and from `App.js` the import, the
  `Screens.FoodCategories` entry and the `Stack.Screen`.
- `CategoriesCarousel` lost its navigation fallback: a tap now always calls `onSelect`,
  which is the only thing any caller ever wanted. (`useNavigation` gone with it.)
- `getSectionPubsTitleKey` from `shared/utils/sections.js`, and the locale keys it and
  the screen owned: `sections.*.pubs`, `view_modes.{dishes,pubs}`,
  `home_page.top_dishes.{all_pubs,pubs_of_category}`,
  `near_categories_page.{headline,pub_is_closed}`. `near_categories_page.nothing_found`
  stays — `PubsList` uses it.

`src/widgets/FoodCategories/` survives: `CategoriesCarousel` (used by the feed) and
`CategoriesList/CategoryList` + `CategoryCard` (used by the categories view inside a pub).

A deep link carrying `Path=FoodCategories` no longer resolves and falls back to Home,
which is `useLinkedDestination`'s normal behaviour for an unknown path.

### Follow-ups from this round
- `useTopDishes` keeps loading the 8 nearby menus while the establishments view is on
  screen. It is cached and makes switching back instant, but it is work nobody asked for;
  if it ever hurts, gate the hook on `isPubsView`.
- `DishCard` (the big card of the category → dishes flow) is still the old design and is
  now the only surface that is.

---

## 2026-08-25 (third round) — controls and popups

### The view switch inside a pub showed no labels

`ViewModeSwitch` had `flex: 1` on the option `View` *inside* a `flex: 1`
`TouchableOpacity` *inside* a row. With no definite height anywhere in that chain the
option could resolve to nothing and the label was clipped away. Fixed by giving the
option an explicit `height: 46` with `justifyContent: "center"` and dropping its `flex`
(the touchable keeps it, which is what distributes the width). Labels also got
`lineHeight`, `includeFontPadding: false` and `numberOfLines={1}`.

### Bigger add/remove controls, in one place

`widgets/Common/QuantityStepper.jsx` replaces four hand-rolled steppers (feed card, menu
row, basket line, dish popup). Two sizes — `md` 40px, `lg` 48px — two tones (`solid`
emerald for cards and menus, `light` grey for the basket), and it renders the single
round "+" itself when the count is zero. The old controls were 28–34px with 30px icon
images; these are finger-sized and identical everywhere.

### Every popup is the same sheet now

`widgets/Common/BottomSheet.jsx` (+ `SheetButton`): dimmed backdrop, 26px radius, handle,
optional title/subtitle, a close button, safe-area bottom padding and an optional
scrolling body. The old popups each carried their own copy of a style object with
`backgroundColor: 'transparent'` for the overlay (nothing dimmed behind them) and a
hardcoded `paddingTop: 50 / paddingBottom: 100`.

Migrated: `DishImagePopup` (rebuilt — big photo, price and an `lg` stepper, no more
"Назад" button), `ClearBasketPopup`, `RemoveDishPopup`, `PubNotAvailableForDeliveryPopup`,
`DeleteClientPopup` (which also showed its own headline twice), `PubInfoPopup`.

New keys: `dish_popup.in_basket`, `pub_not_available_for_delivery.title`.

---

## 2026-08-25 (fourth round) — checkout polish, Android sheets, production cost

### Checkout

- One address control instead of two: «Изменить адрес» opens `AddressPickerSheet`, which
  already carries both the saved addresses and «Добавить новый адрес» → the map. The
  separate «Указать на карте» button and the `create_order_page.additional_data.pin_on_map`
  key are gone; `address.choose_saved` was renamed to `address.change`.
- **Inputs had no outline at all.** `inputs.styles.js` set `borderColor` without a
  `borderWidth`, so every field was a white box on a white card — invisible on the new
  checkout. Added `borderWidth: 1.5`, a neutral `#d4d4d8` and a 14px radius. This also
  fixes the auth screens, which had the same invisible fields on the grey background.
- The floating label of an `Input` travels 30px above its field, which landed it on the
  card title. Each input block now opens with a 22px spacer.
- `+373` sat 18px above the phone field it belongs to (`position: relative; top: 6px`
  against an input that carries its own `marginTop: 18`). The phone rows are plain RN
  now, with the prefix following the same margin.
- `BasketSummary` gained a `plain` variant: on checkout it sits inside a card, and a
  white card inside a white card read as a mistake. It is a bordered block there.
- The submit bar padded the safe-area inset a second time (the `Wrapper` already
  reserves it). Removed, like on the basket screen.

### Android bottom sheets

Every popup renders through one `Modal` (in `BottomSheet`), and it had only
`statusBarTranslucent`. On Android that leaves the modal window ending at the navigation
bar, so a strip of the live screen stayed visible and undimmed under the sheet. Added
`navigationBarTranslucent` (RN 0.79 supports it; it warns unless `statusBarTranslucent`
is also set, which it is). The sheet already pads `insets.bottom`, so its white area now
paints the gesture strip instead of leaking the screen behind it.

### Production cost

- `console.log` and `console.debug` are replaced with no-ops when `!__DEV__` (one guard
  in `App.js`). Arguments are still evaluated, so the worst offenders were deleted
  outright as well: `pubsApi` was logging whole API responses, `LinkingWathcer` printed
  eleven lines per deep link, `VersionWatcher` logged on every poll.
- **`VersionWatcher` polled every 5 seconds** — 720 requests an hour to read a number
  that changes on a release. Now every 5 minutes, and `skipPollingIfUnfocused`.
- `skipPollingIfUnfocused: true` added to every remaining 20-second poll (Home, the
  nearby-categories hook, basket, checkout, pub info, the create-order button). They used
  to keep polling while the app was in the background.
- `useTopDishes` takes a `skip`: the establishments view fetched eight pub menus it never
  rendered.
- One shared pulse animation for all skeletons (`Skeleton.jsx`), ref-counted so the loop
  runs only while something is on screen. A loading screen shows six to ten blocks, and
  it used to start a loop per block.
- `memo` on the leaves that re-render with every parent keystroke: `ViewModeSwitch`,
  `QuantityStepper`, `BasketSummary`, `SectionCard`, `TopDishesFilters`, `DishCardSkeleton`.
- `removeClippedSubviews` on `PubsList` and the basket list. Deliberately **not** on
  `FullMenuList`: combined with sticky section headers it is a known source of vanishing
  headers.

---

## 2026-08-26 — startup crash and the require cycles behind it

### `Property 'memo' doesn't exist` — the app did not open at all

`SectionCard.jsx` (the first screen) called `memo(SectionCard)` without
`import { memo } from "react"`. My own doing: the batch edit that added `memo` to five
leaf components skipped adding the import for the one file that already imported
*something* from react — and nothing verified it. Hermes throws a `ReferenceError` on
first render, so the app crashed before anything was drawn.

**Why nothing caught it.** Everything I had been running — `babel.parseSync` per file,
relative-import resolution, the locale-key sweep — checks *shapes*, never whether an
identifier is actually bound. A file with a missing import parses fine and bundles fine.

Added to `CLAUDE.md` as the standing verification recipe:

1. `npx expo export --platform ios --output-dir .expo-export-check` — the real production
   bundle (5.9 MB of Hermes bytecode); the whole graph must resolve and compile.
2. An **undefined-reference sweep** with `@babel/traverse`: every `ReferencedIdentifier`
   whose name has no binding in scope and is not a known global. This is the one that
   catches a missing `memo`. The codebase is clean by it now.
3. Per-file parse + import resolution, as before.

### Require cycles

Metro warned about three (`App.js → screen → form → App.js`) and a graph walk found two
more that had not been hit yet. All of them existed for one reason: `Screens` was
exported from `App.js`, and six widgets imported it from there.

`Screens` now lives in `src/app/navigation/screens.js`; `App.js` imports it and re-exports
it for compatibility. The six importers (`useLinkedDestination`, the auth forms,
`OrderInfo`, `LinkingWathcer`, `VersionWatcher`) point at the new module. A cycle walk
over `src/` + `App.js` now reports none.

This was not cosmetic: cycles resolve to whatever module finished initialising first, so
`Screens` could legitimately have been `undefined` at import time in one of those files —
a navigation call to `undefined` that only shows up on some cold-start orders.

---

## 2026-08-26 — Google Play rejected the bundle (not a code problem)

Play refused the upload with "не позволяет существующим пользователям обновить наборы
App Bundle". Nothing in `src/` can cause that; it is purely the version code.

`npx eas build:list --platform android` tells the story:

```
2026-08-25  1.2.50  versionCode 52   <- the build being uploaded
2026-05-12  1.2.45  versionCode 63
2026-05-12  1.2.45  versionCode 62
2026-05-12  1.2.45  versionCode 61
```

`eas.json` uses `appVersionSource: "local"` + `autoIncrement: true`: EAS bumps
`expo.android.versionCode` **in the working tree** on every build. The May builds reached
63 and were never committed, so the repo still said 51 and the new build came out as 52 —
lower than what users already have, which is exactly what that message means.

Checked whether the `git reset --hard HEAD` at the start of the 08-24 session destroyed a
local bump: the clone (08-20) already had 51 and there are **no EAS builds between 08-20
and 08-25**, so nothing was lost there. The drift is from May, in a different checkout.

Fix: `app.json` versionCode set to **63**, so the next `autoIncrement` build produces 64 —
above every bundle EAS has ever built. iOS was already in sync (buildNumber 7 in both).

The durable fix, not applied because it moves the source of truth for the release
pipeline: `appVersionSource: "remote"` plus a one-off `eas build:version:set` (that
command is interactive, so it needs a human). Until then, **commit `app.json` after every
build** — noted in `CLAUDE.md`.
