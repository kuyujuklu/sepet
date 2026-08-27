# Free-delivery nudge while adding/removing dishes

Date: 2026-08-27

## What & why

Some pubs offer free delivery above a spend threshold
(`shipping_free_delivery_price` on a nearby-pubs entry). That threshold was only
ever surfaced on the Basket screen's summary (`BasketSummary.jsx`'s existing
"X left for free delivery" hint) - nowhere on the screens where a client actually
adds or removes items (Home's dish feed, a pub's menu), so there was no live
feedback while shopping. Asked to notify the client, as they add/remove items on a
pub that has this offer, how much more they need to spend to unlock free delivery.

## Files

### Added

- `src/widgets/Basket/FreeDeliveryHint.jsx` - the hint itself (text + progress
  bar), extracted out of `BasketSummary.jsx` so it has exactly one implementation.
  Renders nothing when `leftAmount` is not a positive number.

### Modified

- `src/widgets/Basket/BasketSummary.jsx` - now renders `FreeDeliveryHint` instead
  of its own inlined copy of the same markup/styles.
- `src/widgets/Basket/BasketFloatingBar.jsx` - the actual fix. This is the pill
  that appears over the feed as soon as the basket has something in it, and it is
  already mounted on both screens where dishes get added/removed
  (`Home.jsx` and `PubInfoPage.jsx` - confirmed these are its only two call
  sites). It now also queries `useGetNearbyPubsQuery` (same args Home/PubInfo
  already query with, so RTK Query serves it from their cache once that has
  resolved - no extra request in the common case), looks up the current basket's
  pub in that list, and renders `FreeDeliveryHint` right above the pill whenever
  `getAmountLeftForFreeDelivery` (existing util, unchanged) returns a positive
  amount.

## How it works

No new state, no debounce, no toast/animation system - the hint is just another
piece of UI computed from the same `basket` redux state the pill's own count/price
already reads. Every `increaseDish`/`decreaseDish` dispatch (from any card's
`QuantityStepper`, on any screen) re-renders `BasketFloatingBar` like it always
did, so the hint's amount and progress bar update on the very next render after
each tap - no separate "add/remove" event to wire up. It disappears the moment the
threshold is reached (delivery is then actually free) or the basket empties.

Pubs with no free-delivery offer (`shipping_free_delivery_price` absent or 0) or
not in the nearby-pubs list (out of delivery range) simply get `nearbyPub` as
`null`/thresholdless, so `getAmountLeftForFreeDelivery` returns `null` and nothing
renders - same behavior the Basket screen already had.

## Backend gaps

None - `shipping_free_delivery_price` was already being fetched and used
elsewhere (see `changes/2026-08-25-catalog-views-basket-checkout.md` and
`getDeliveryPrice`/`getAmountLeftForFreeDelivery` in `shared/utils/basket.js`).

## Known limits / follow-ups

- Verified with `npx expo export --platform ios` and `babel.parseSync` on the
  three changed/added files. Not opened on a device - worth checking in hand that
  the hint sliding in above the pill doesn't feel like it's fighting the pill's
  own position, especially on the shorter Android floor value.
- Text is the same locale key the Basket screen already used
  (`basket_page.free_delivery_left`) - no new locale strings needed.
