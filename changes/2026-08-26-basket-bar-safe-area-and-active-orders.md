# Basket floating bar: safe-area fix + active-orders fallback

Date: 2026-08-26

## What & why

Three asks, all the same root bug plus one feature:

1. The Home floating bar was still sitting under the buttons of an old (3-button nav)
   Android - a safe-area bug, not fixed by the `Wrapper`/`BottomSheet` insets work done
   earlier today.
2. When the basket is empty there is nothing to tap into from Home any more - the client
   wanted an "active orders" plaque in that spot instead, so an order already placed stays
   reachable with one tap; it should get out of the way again once the basket has
   something in it.
3. Same-day follow-up: the "Далее"/submit button had the identical under-the-nav-bar
   problem on both the basket screen and checkout - same bug, different screens, same fix.
   A sweep for the same pattern (`position: "absolute"` pinned to the bottom edge with no
   inset math) turned up a fourth instance nobody had reported yet: the "в корзину"
   shortcut on the pub menu screen itself (`PubInfoPage`).

## Files

### Added

- `src/widgets/Orders/ActiveOrdersFloatingBar.jsx` — same pill shape/shadow as
  `BasketFloatingBar`, blue (`#1d4ed8`) instead of green so the two are never confused at a
  glance, order-list icon + count badge + "Активные заказы". Renders `null` when there is
  nothing active (mirrors `BasketFloatingBar`'s `count === 0` bail-out). One active order
  goes straight to `OrderInfoPage`; more than one goes to the `Orders` list.
- `src/shared/hooks/useSafeBottomInset.js` — `useSafeBottomInset(gap = 0)`: the actual
  safe-area fix, factored out once a second and third screen turned out to have the same
  bug (see below). Every bottom-anchored absolute bar/button in the app should use this
  instead of a static `bottom: 0`/`bottom: 12`.

### Modified

- `src/features/store/orders/ordersSlice.js` — `selectActiveOrders`: everything that is
  not `completed` or `canceled`.
- `src/pages/Home/Home.jsx` — the two bars are mutually exclusive now:
  `hasBasketItems ? <BasketFloatingBar /> : <ActiveOrdersFloatingBar />`, decided from
  `selectBasket` + `getBasketCount` (same helper `BasketFloatingBar` already used
  internally). Bottom offset now comes from `useSafeBottomInset(12)`.
- `src/pages/Basket/BasketPage.jsx`, `src/widgets/Orders/CreateOrder/CreateOrder.jsx` —
  the submit-button `bottomBar` in both screens had the exact same
  `position: "absolute", bottom: 0` bug as the Home bar (same broken assumption, see below).
  `bottom` moved out of the static `StyleSheet` and is set inline from
  `useSafeBottomInset()`.
- `src/pages/PubInfo/PubInfoPage.jsx` — its own `BasketFloatingBar` (the pub menu screen
  has one independent of Home's) used `bottom={0}` as a bare native-base prop, which is a
  second, smaller bug stacked on the same one: a bare number there is a spacing-scale
  token, not pixels, so even a correct inset value would have been misread. `bottom` moved
  into `style` and is set from `useSafeBottomInset()`.
- `src/shared/analytics/events.js` — `activeOrdersBarOpened`.
- `assets/locales/{ru,ro,gz}.js` — `home_page.active_orders`. No pluralization (this repo
  has none anywhere - Russian's 1/2-4/5+ rule is exactly why): the badge carries the count,
  the label stays a fixed noun phrase, same trick `BasketFloatingBar` already uses.

## How it works

**The safe-area bug.** All three bars were `position: "absolute"` with a static `bottom`
(`12` on Home, `0` on the two submit bars) and no inset math of their own - each relied on
the ancestor `Wrapper`'s `paddingBottom: insets.bottom` to already keep it clear of the
system bar. That reliance was the bug on two counts:

1. Whether an absolutely positioned child even resolves its offsets against an ancestor's
   *padding* box (CSS does; React Native's Yoga has a history of not always agreeing) was
   never actually verified for this layout - so a static `bottom` may have been measured
   from the outer edge of the *whole* screen the entire time, with the ancestor's
   `insets.bottom` padding contributing nothing to it.
2. Even where `insets.bottom` reaches the right place, this exact app has already been
   caught under-reporting it on real Android hardware - see the `BottomSheet` fix earlier
   today (`changes/2026-08-26-first-screen-controls-orders-safe-areas.md`): "a see-through
   strip under every popup" on a Xiaomi, where `useSafeAreaInsets().bottom` measured ~0 in
   the plain app window against a real ~49 dp system gap.

Fixed by no longer depending on inherited padding anywhere: `useSafeBottomInset(gap)` calls
`useSafeAreaInsets()` itself and returns the offset to set `bottom` to explicitly. On
Android the inset is floored at `MIN_ANDROID_BOTTOM_INSET = 64` inside the hook (the same
number `BottomSheet`'s own Android fix already uses for the identical symptom) before
adding `gap`, so a legitimately larger inset is kept as-is and only a suspiciously
small/zero one gets a guaranteed floor. Home passes `gap: 12` (space between the pill and
the edge); the two submit bars pass no gap, since they already have their own
`paddingBottom: 12` baked into the bar itself.

This started as a one-screen fix (inline in `Home.jsx`) and got promoted to a hook the
moment the identical bug turned up on `BasketPage` and `CreateOrder` - same mistake,
copy-pasted across three screens originally, now one function to keep them from drifting
apart again. Any future bottom-pinned absolute element should reach for this hook by
default rather than re-deriving the same math.

**Active orders.** `OrdersPreloader` (mounted globally in `App.js`, not per-screen) keeps
`orders.orders` current over the websocket regardless of which screen is open, so
`selectActiveOrders` is already populated by the time Home reads it - no new data fetch
needed.

## Backend gaps

None - both fixes are client-side (layout math and a redux filter over data the app
already had).

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (module graph resolves/compiles)
  and reading every file back; not run on a device. The specific device/OS combination
  that showed the original bug was never named, so the `MIN_ANDROID_BOTTOM_INSET = 64`
  floor is carried over from the `BottomSheet` fix on faith that it is the same root
  cause - worth confirming on an actual 3-button-nav Android that all four bars now
  clear it (Home pill, basket submit, checkout submit, pub-menu basket shortcut).
- If `insets.bottom` is ever fixed upstream (a `react-native-safe-area-context` version
  bump, or the edge-to-edge quirk getting resolved), this hook's floor and `BottomSheet`'s
  `BOTTOM_OVERSHOOT` become unnecessary defensive code worth revisiting together.
- A repo-wide grep for `position="absolute"`/`position: "absolute"` was checked against
  every hit: everything left is a small decorative offset inside a card/image (badges,
  veils, a stepper corner), not a screen-edge safe-area bar - so the four fixed here should
  be all of them today. Any *new* bottom-pinned absolute bar should reach for
  `useSafeBottomInset` from the start rather than reintroduce this.
- The active-orders bar always targets the single most recently active order when there is
  exactly one; with several active orders it goes to the list instead of picking one -
  fine for now, but worth a "most urgent status" heuristic if that ever feels wrong in
  practice.
