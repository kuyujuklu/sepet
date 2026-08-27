# Fix: gap under Дальше/Создать заказ bars showing list content

Date: 2026-08-27

## What & why

Earlier today's Android safe-area fix (`changes/2026-08-27-basket-bar-safe-area-and-active-orders.md`)
pushed the whole `bottomBar` box up by the safe inset (`bottom: bottomBarInset`) on
`BasketPage` and `CreateOrder`, to clear an old Android's 3-button nav bar. That fixed the
button being hidden under the nav bar, but for a full-width bar it was the wrong half of
the box to move: it left a gap between the bar's bottom edge and the true screen edge,
with the page's own list scrolling visibly through that gap instead of stopping under an
opaque bar.

The Home floating pills (`BasketFloatingBar`, `ActiveOrdersFloatingBar`,
`PubInfoPage`'s basket shortcut) do not have this problem and were not touched - a gap
around a small floating rounded pill is the intended look there. `BasketPage` and
`CreateOrder`'s bars are full-width, bordered, opaque bars - the platform-standard fix for
those is to keep the box itself flush to the true edge and put the safe-area clearance
*inside* it as extra `paddingBottom`, so the opaque background reaches the edge and only
the tappable button moves up to clear the nav bar.

## Files

### Modified

- `src/pages/Basket/BasketPage.jsx` — `bottomBar` back to `bottom: 0`; the inline override
  changed from `{ bottom: bottomBarInset }` to `{ paddingBottom: 12 + bottomBarInset }`
  (the `12` is the bar's original breathing room, previously a static style value).
- `src/widgets/Orders/CreateOrder/CreateOrder.jsx` — identical change to its own
  `bottomBar`.

## How it works

The bar's top edge ends up at exactly the same height above the screen as before (padding
absorbed into the box instead of an outer offset moving the whole box), so nothing needed
to change in either screen's list `contentContainerStyle.paddingBottom` - the space
reserved for the bar was already correct, only the bar's own box needed to stretch down to
fill it with its background instead of floating above it.

## Backend gaps

None - client-side layout only.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and reading both files
  back; the actual visual result (no more visible gap on an old Android) was not confirmed
  on a device.
- If any *other* full-width bottom bar is added later, it should default to this
  `bottom: 0` + `paddingBottom: <gap> + useSafeBottomInset()` pattern rather than the
  floating-pill `bottom: useSafeBottomInset(<gap>)` pattern `useSafeBottomInset` also
  supports - the two are for different shapes of bar and are easy to mix up (this bug was
  exactly that mix-up).
