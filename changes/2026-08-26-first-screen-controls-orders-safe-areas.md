# 2026-08-26 — First screen language, home controls in popups, orders redesign, safe areas

## What & why

One pass over the whole shell of the app after a round of user feedback: the first screen
(`SectionPicker`) could not change the language, every screen painted under the Android
status bar (the app is edge-to-edge), several screens had no way back at all, the home feed
spent two full rows on two carousels, and the orders screens were still in the old
native-base style with a different card, a different font and a different gutter from the
rest of the redesigned app.

## Files

Added

- `src/widgets/FoodCategories/CategoriesSheet.jsx` — the whole category list as a grid of
  full-size chips inside a `BottomSheet`; opened from the "more" chip of the half-width
  strip on the home screen.
- `src/widgets/Orders/useRepeatOrder.js` — "repeat this order" as one hook (checks the
  delivery zone and opening hours, lazily fetches the menu, rebuilds the basket, navigates
  to it once). Used by both the order card and the order screen.

Modified

- `App.js` — `expo-status-bar` with `style="dark"` (the app paints under the status bar,
  every screen is light); dropped the unused `react-native` `StatusBar`/`ActivityIndicator`
  import.
- `src/pages/Wrapper.jsx` — top inset added. This is the actual fix for "everything is
  under the clock on Android".
- `src/pages/Sections/SectionPickerPage.jsx` — language segmented control, top right.
- `src/pages/Home/Home.jsx` — back arrow to the section picker; the basket pill no longer
  adds the bottom inset a second time.
- `src/pages/PubInfo/PubInfoPage.jsx` — a way back from a category to the category list
  (the nested stack cannot use the screen header); same double-inset fix.
- `src/pages/Auth/{Authentication,Registration,ChangePassword}` — an `AppHeader` with a
  back arrow; these three screens had no way out except finishing the form.
- `src/pages/Orders/OrdersPage.jsx` — rewritten: header, skeleton, designed empty state,
  no lazy-import/`setTimeout` mounting hack.
- `src/pages/Orders/OrderInfoPage.jsx` — `AppHeader` with the order number as the title and
  the orders list as the fallback target.
- `src/pages/Internet/NoInternetPage.jsx` — was a bare `<Text>` with no layout at all.
- `src/pages/Version/ExpiredVersionPage.jsx` — wrapped in `Wrapper` for the insets.
- `src/widgets/AppHeader/AppHeader.jsx` — `fallbackScreen` prop: where the back arrow leads
  when the stack has nothing to pop.
- `src/widgets/Profile/SwitchLanguage.jsx` — rewritten as a segmented control in plain RN
  styles, sized by props, used on both the profile and the first screen.
- `src/widgets/FoodCategories/CategoriesCarousel/CategoryChip.jsx` — `compact` pill variant.
- `src/widgets/FoodCategories/CategoriesCarousel/CategoriesCarousel.jsx` — `compact`,
  `contentPadding`, and an optional trailing "more" button.
- `src/widgets/TopDishes/TopDishesFilters.jsx` — no longer a carousel: exports
  `FiltersButton` (shows the active filter) and `FiltersSheet` (the options as rows).
- `src/widgets/TopDishes/TopDishesList.jsx` — new header: half-screen category strip +
  filters button, and the "Хиты продаж" text block moved *under* them.
- `src/widgets/Orders/OrdersList/OrderCard.jsx` — redesigned; the per-card menu request is
  gone (it is what made the screen need a lazy mount).
- `src/widgets/Orders/OrdersList/OrderInfo.jsx` — redesigned as cards.
- `src/widgets/Orders/OrdersList/OrderList.jsx`,
  `src/widgets/Orders/OrdersList/OrderListWithAllClientOrders.jsx` — app gutter, card gap,
  and no more 6-order cut.
- `src/shared/utils/order-utils.js` — `getOrderStatusColors` (hex pairs for the badge)
  replaces `getOrderStatusColor` (native-base tokens).
- `src/shared/utils/foodCategories.js` — `getCategoryImage` exported (the carousel and the
  new sheet both need it).
- `assets/locales/{ru,ro,gz}.js` — new keys (see below).

## How it works

**Safe areas.** `app.json` has `android.edgeToEdgeEnabled: true`, so the app really does
draw under the status bar and under the gesture pill; `Wrapper` used to add
`paddingTop: Platform.OS === "ios" ? 30 : 0`, which is why Android looked broken and iOS
looked wrong on notched devices. It now uses `insets.top`, falling back to
`StatusBar.currentHeight` on Android because the provider reports 0 on the very first
layout pass. Every screen in the stack goes through `Wrapper` (that was the reason for
wrapping `NoInternetPage` and `ExpiredVersionPage` too). Two screens then added the bottom
inset a second time to their floating basket bar — that is now a plain 12 px gap.

**Back.** `AppHeader` already had `showBack`, but its fallback was hard-coded to `Home`,
and Home itself never showed it. The prop `fallbackScreen` makes the target explicit:
Home falls back to the section picker, the order screen falls back to the orders list.
The category view inside a pub is a *nested* navigator, so its back has to be inside the
nested screen (`DishesScreen`) — the header arrow belongs to the outer stack and would
leave the pub entirely.

**Language on the first screen.** Same `SwitchLanguage` component as the profile, so there
is one control and one `AsyncStorage` key (`lang`, read back in `App.js` on start). It sits
above the logo: a client who cannot read the headline has to be able to fix that first.
`i18n.language` can be a full tag (`ru-RU`), hence the `split("-")[0]`.

**Home header.** The strip of categories is `Math.round(screenWidth / 2) - SCREEN_PADDING`
wide, so it ends exactly at the middle of the screen, and the filters button takes the rest
of the row (`flex: 1`). The strip uses the new compact pills; the last item is a dashed
"more" chip that opens `CategoriesSheet` with every category as a full-size chip. The
filters button always shows the active filter as its second line, because the filters
themselves are now inside `FiltersSheet` — sort orders and the "establishments" view are
two visually separated groups there. Both sheets are rendered outside the list (not inside
`ListHeaderComponent`) so a feed re-render cannot remount an open modal. The "Хиты продаж"
title + subtitle block was moved below the controls row: it is a caption for what is
already on the screen, not a page header.

**Orders.** Both screens are plain react-native styles now, with the same white
`borderRadius: 20` cards, the same `SCREEN_PADDING` gutter and one status badge
(`getOrderStatusColors` returns a text colour and its tint). The card no longer fetches the
menu of its pub — that request only happens when the client presses "repeat", through
`useRepeatOrder`, which also fixed a real bug: the old code called `navigate("Basket")`
*inside* the loop over the dishes, so a three-dish order pushed the basket screen three
times. Because the cards are cheap now, `OrdersPage` dropped the `lazy()` + `setTimeout`
mounting trick and `OrderList` dropped the "only the six latest orders" cut. Orders arrive
over a websocket with no loading flag at all, so the empty state waits 900 ms before it is
allowed to say "you have not ordered anything".

**New locale keys** (all three files, ro/gz are my approximations and need a native check):
`categories.show_all`, `categories.sheet_title`, `categories.sheet_subtitle`,
`home_page.top_dishes.filters_button`, `.filters_title`, `.filters_dishes_group`,
`.filters_pubs_group`, `order_page.no_orders_text`, `order_page.no_orders_button`,
`order_info_page.dishes_title`, `order_info_page.no_dishes`, `internet.no_internet_title`,
`internet.no_internet_text`.

## Backend gaps

- `missing data` — **an order does not carry the names of its dishes.** `order.dishes[]` is
  `{dish_id, count, dish_price}`, so the order screen has to fetch the whole menu of the pub
  and join on `dish_id` just to print a line. A dish that was removed from the menu
  disappears from the order the client already paid for, and makes "repeat" fail outright.
  Needed: `name` (and ideally `image`) on `order.dishes[]`. The client can then drop the
  `getPubInfo` query in `OrderInfo` entirely, and `useRepeatOrder` would only need the menu
  for today's prices.
- `missing data` — **no totals on an order.** Only `delivery_price` comes from the server;
  the items sum and the grand total are recomputed on the client from
  `count * dish_price`. Any server-side discount, promo or rounding rule will make the
  number on the screen wrong. Needed: `items_price` and `total_price` on the order.
- `API change needed` — **no pub object on an order.** `order.pub_name` is the only pub
  field; `OrderInfo` used to read `order.pub.name`, which is never populated (it printed
  nothing). The currency also has to come from `pub-info`, so an order screen with a failed
  pub request falls back to "Lei". Needed: `pub: {id, name, currency_id}` on the order.
- `missing data` — **no status history / ETA.** The screens can only show the current
  status as a badge; there is nothing to build a "preparing → courier → delivered"
  timeline from, which is the obvious next step for the order screen.
- `API change needed` — **orders only exist over the websocket.** `GET /api/client/orders/`
  is declared in `ordersApi` but nothing calls it, so no screen has a loading state for the
  order list, hence the 900 ms grace timer in `OrdersPage`. Either the REST list should be
  used for the first paint (websocket for updates only), or the socket needs to say "this
  is the full list and it is empty". The timer can go once that lands.
- `missing data` — **categories are still a client-side taxonomy** (restated from the
  earlier notes). The new categories popup can only show the slugs
  `shared/utils/foodCategories.js` knows about; a real category dictionary from the server
  would let the sheet show everything a pub actually has.

## Known limits / follow-ups

- ro/gz strings for the new keys are mine, not a native speaker's — flag for review.
- The compact category pills are sized by their caption, so `CategoriesCarousel` cannot use
  `getItemLayout` in compact mode; `scrollToIndex` falls back to the existing retry path.
  Long captions ("восточная кухня") make one wide pill in a half-screen strip — the popup is
  the answer for browsing, but it is worth watching.
- `NoInternetPage` is still registered but never navigated to (`InternetChecker` only
  raises an alert). It is designed now, but the real decision — screen or alert — is open.
- `OrderList` renders every order the socket sent. There is no pagination anywhere in the
  API; a client with hundreds of orders will now render all of them.
- `RateOrderButton` is still native-base inside two otherwise plain-RN cards. It looks
  fine, but it is the last piece of the old style on those screens.
- Verified with `npx expo export --platform ios` and the `@babel/traverse`
  undefined-reference sweep (see `CLAUDE.md`); not run on a device.

---

## 2026-08-26 (later) — Android: the strip under the sheet, and the row split

Two things reported off a device screenshot (Xiaomi, gesture navigation).

**A see-through strip under every popup.** The white box of a `BottomSheet` stopped about
49 dp above the bottom edge of the screen; the dimmed home screen (the floating basket
pill) showed through underneath. Measured off the screenshot: the dim below the sheet is
exactly `rgba(0,0,0,0.4)` over `#059669` and over `#f5f5f5`, i.e. it is *our* overlay, so
the modal window does reach the bottom of the screen — it is the sheet inside it that does
not. The insets do not agree either: `useSafeAreaInsets().bottom` is ~0 in the app window
and ~16 dp inside the dialog window, and neither number is the 49 dp gap.

Rather than guess at the Android window flags again (`statusBarTranslucent` +
`navigationBarTranslucent` are already both set, and `WindowUtil.setSystemBarsTranslucency`
does call `setDecorFitsSystemWindows(false)`), the sheet now simply paints more than it
occupies: `marginBottom: -64` with `paddingBottom: 64` on the white box. The negative
margin pushes the white past the bottom of the layout box, the padding hands those pixels
back to the content, and when there is no strip to cover the overshoot is clipped by the
window and nobody sees it. `maxHeight` went 88% → 92% to pay for the extra box height.
This works whatever the real cause is, and on iOS it changes nothing.

**The filters button ate the categories.** The half-and-half split left about a chip and a
half of the category strip visible. The button is content-sized now (`alignSelf`, no
`flex: 1`) and the strip takes the rest of the row (`flex: 1`); the button shows the word
"Фильтры" while the feed is in its default order and the name of the applied filter
otherwise, on one line instead of two — so it stays informative without a second row of
text widening it.

**Also from the same screenshot:** the section switcher (Еда / Цветы / Продукты) was cut
off by the right edge of the screen — it is a horizontal `ScrollView` now.

---

## 2026-08-26 (even later) — reverted the home controls swap, fixed discount pricing, centered every popup

Owner feedback on the redesign above: the categories-strip-and-filters-button trade went
the wrong way. Categories (Супы, Мясо, Алкоголь, ...) are looked at rarely and belong
behind a button; the sort/view chips (Хиты, Со скидкой, Ближайшие, Заведения) are used on
most visits and should be one tap again, the way they were before this file's first
section. Two unrelated asks came in at the same time: make the discount price
(`dish.sale_price`) render as struck-through-old + current everywhere, and center every
popup instead of anchoring it to the bottom.

### 1. Home controls: swapped back

- `src/widgets/TopDishes/TopDishesFilters.jsx` — `FiltersButton`/`FiltersSheet` are gone.
  Exports `FiltersCarousel` instead: a horizontal scroll of pill chips — **Хиты · Со
  скидкой · Ближайшие │ Заведения**, divider before the last one because it's a view swap
  (dish grid → `PubsList`), not a sort — same as it was before this file's first section.
  `PUBS_FILTER`/`dishFilters`/`pubsFilter` kept; `getFilterLabelKey` deleted (only
  `FiltersButton` ever called it).
- Added `src/widgets/FoodCategories/CategoriesButton.jsx` — the compact green pill that
  used to be `FiltersButton`, now pointed at categories: default label
  `t("categories.sheet_title")` ("Категории"), swaps to the selected category's caption
  when one is active. Opens the existing `CategoriesSheet` unchanged.
- `src/widgets/TopDishes/TopDishesList.jsx` — `controlsRow` now renders
  `FiltersCarousel` (`flex: 1`) + `CategoriesButton` (fixed), the exact inverse of the
  previous pairing (`CategoriesCarousel` + `FiltersButton`). One compact row, same
  mechanics, content swapped — not two full-width rows again, since a single button no
  longer needs the space a whole category carousel did. `showCarousel` prop renamed
  `showCategoriesButton` (nothing outside this file ever set it). Dropped the
  `areFiltersOpened` state/sheet; chips call `changeFilter` directly now.
- Removed the now-dead `home_page.top_dishes.{filters_button,filters_title,
  filters_dishes_group,filters_pubs_group}` keys from all three locale files. No new keys
  needed anywhere.
- `src/widgets/FoodCategories/CategoriesCarousel/CategoriesCarousel.jsx` is unused again
  (nothing imports the component itself any more, only `CategoryChip` from its folder) —
  left in place, same call as `PubsMap`/`PubList` in the 2026-08-24 note.
- The "Скидки" chip needed no logic change: `getPubDishes` in `shared/utils/topDishes.js`
  already filters to `hasDiscount(dish)` when `filter === deals` (not just a re-sort) —
  picking that chip already shows only sale-priced dishes, sorted by biggest discount
  first. This was true before today too.

### 2. Discount price shown consistently

`src/shared/utils/dish.js`'s `getDishPrices`/`hasDiscount` were already the intended
single source of truth and already correct; most surfaces (`DishRow`, `TopDishCard`,
`DishImagePopup`, `BasketItemRow`) already used them. Two gaps fixed:

- `src/widgets/Dish/DishCard.jsx` (still live — it's what `DishList.jsx` renders for the
  "list view" inside a pub's menu) had its own copy of the commission/discount math
  instead of calling `getDishPrices`, with a real bug: `dish.price`/`dish.sale_price` are
  strings from the API, and its local `addCommissionToPrice` did
  `price + (price/100)*commission` — with a string `price` the `+` concatenates instead of
  adding (`"45.50" + 2.28` → `"45.502.28"`), and nothing rounded the result through
  `formatPrice`. Replaced with `getDishPrices(dish, pub)` + `formatPrice()`, kept the
  card's own red strikethrough color. `increaseDish`/`openDishImagePopup` now pass
  `prices.basketPrice`/`prices.commission` instead of the old local variables.
- `src/widgets/Orders/CreateOrder/CreateOrder.jsx`'s checkout review list showed only the
  paid line total, no old price. Added `getDishPrices(dish, pub)` per line and, when
  `prices.oldPrice` is set, a small strikethrough `oldPrice * count` above the current line
  total — same stacked-right layout `BasketItemRow.jsx` already uses.

Left alone: `DishImagePopup.jsx` already computed and showed the strikethrough correctly;
it just does the math locally because its redux popup state only carries `commission`, not
the full `pub` object, and threading `pub` through there just for this would be pure churn.
Noticed but out of scope: `DishImagePopup.jsx` hardcodes `"Lei"` instead of the pub's
currency symbol.

### 3. Every popup is now a centered dialog

All 9 popups in the app (5 mounted globally in `App.js`, plus `PubInfoPopup`,
`CategoriesSheet`, `AddressPickerSheet`, and `FiltersSheet` before it was deleted above)
render through one shared component, so this was a single-file change:
`src/widgets/Common/BottomSheet.jsx`.

- `overlay`: `justifyContent: "flex-end"` → `justifyContent/alignItems: "center"`, plus
  `padding: SCREEN_PADDING` so the dialog never touches the screen edge.
- `sheet`: rounded on all four corners now (was top-only), `width: "100%"` capped at
  `maxWidth: 440` and `maxHeight: "80%"` — capped instead of letting the box grow to
  content, so a long list (all categories, saved addresses) scrolls inside the dialog via
  the existing `scrollable` prop rather than stretching it off-screen.
- Removed the drag `handle` (a bottom-sheet affordance with no meaning once centered — ✕
  and the backdrop tap remain the two ways to dismiss) and the Android
  `marginBottom: -64`/`paddingBottom: 64` overshoot hack from the section above (it only
  existed to bleed a bottom-anchored sheet past the nav bar; irrelevant once the box floats
  with margin on every side). Also dropped the `useSafeAreaInsets` bottom padding on
  `body` for the same reason.
- `animationType`: `"slide"` → `"fade"`.
- Collapsed the sheet's `View` + the stop-propagation `Pressable` into one `Pressable`
  carrying `styles.sheet` directly. This isn't just tidying: `width: "100%"` only resolves
  against a parent with a real width, and the old wrapper `Pressable` had none (it
  shrink-wrapped its child) — nesting it that way would have left the percentage with
  nothing to resolve against once `overlay` stopped stretching its children.

No changes needed in any of the 9 individual popup files - they only ever passed
title/subtitle/children into `BottomSheet`.

## Backend gaps (this section)

None - everything above is client-side layout/logic; the discount field
(`dish.sale_price`) and the deals filter already existed and needed no API change.

## Known limits / follow-ups (this section)

- Not run on a device or in the simulator this session — verified with
  `npx expo export --platform ios` only (whole module graph resolves/compiles) plus
  reading every touched file back. Worth a manual pass: the four home chips (especially
  Заведения swapping to `PubsList` and back), a sale dish through feed → detail popup →
  pub menu list → basket → checkout, and every popup's centered layout including the two
  long lists (`CategoriesSheet`, `AddressPickerSheet`) actually scrolling inside the capped
  box instead of overflowing it.
- `maxWidth: 440` on the dialog was picked to look reasonable on both a phone and a tablet;
  nobody has actually checked it on a tablet.
- `CategoriesCarousel.jsx` (the carousel component, not `CategoryChip`) is dead code again;
  flagged, not deleted, per this repo's usual call on code left over from a reverted
  direction.
