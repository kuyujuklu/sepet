# Fix: delivery showed as free for addresses outside the delivery zone

Date: 2026-09-04
Scope: `app` (this note) + a same-day `front` fix (not covered by this file's
convention) + a same-session `backend` fix from 2026-09-03 that this one is
downstream of.

## What & why

Reported live on production: both customer-facing clients (`app`, `front`)
showed delivery as free for an address outside a pub's delivery zone,
instead of showing it as unavailable. Root cause was a chain of two bugs:

1. `pubsApi.js`'s `transformResponse` set `pub.isAvailableForDelivery` from
   work-hours alone, never folding in `pub.shipping.available` (the
   server's zone-based flag) - an out-of-zone address at an otherwise-open
   pub read as available.
2. `getDeliveryPrice()` in `basket.js` returned `pub.shipping_price` as-is
   with no availability check. That field is a plain Go `float64` on the
   backend - never actually `null`, just `0` for an out-of-zone point,
   indistinguishable from a genuinely free zone.

This was likely always latent but only became visible today: the backend's
`orders/preview` (the authoritative price) got its own zero-outside-zone fix
in the 2026-09-03 session (`ErrLocationNotInDeliveryZone` in
`pubsservice.go`), so `preview` now correctly fails for an out-of-zone
address instead of also silently returning 0 - which means `BasketPage`
started falling back to the client-side `getDeliveryPrice()` computation
for exactly this case, surfacing its own separate, older bug.

## Files

### Modified

- `src/shared/api/pubs/pubsApi.js` - `isAvailableForDelivery` now
  `pubWorkHours.isAvailableForDelivery && pub.shipping?.available !== false`.
- `src/shared/utils/basket.js` - `getDeliveryPrice()` returns `null` when
  `nearbyPub.shipping?.available === false`, matching this file's existing
  "nothing to show yet" convention (same as `getAmountLeftForFreeDelivery`).
  Safe for its other caller shape too: the nearby-pubs list never includes
  an out-of-zone pub in the first place (server-side filtered), so
  `.shipping` is simply absent there and the check no-ops.

### Not modified

- `BasketSummary.jsx` already had the right `deliveryPrice === null` -> "—"
  rendering in place (with a comment anticipating exactly this case) - no UI
  change needed, only the data feeding it was wrong.

## How it works

See "What & why" - no new mechanism, just correcting which flag two
existing consumers key off of.

## Backend gaps

None - the backend (`pub.go`'s `GetShippingPricesForPubAvailableForPoint`
handler) already returns `shipping.available: false` correctly; this was
purely a client-side gap in using it.

## Known limits / follow-ups

- **Not verified on-device** - same standing constraint as every push
  change in this repo. Verified via a full `expo export --platform ios`
  production bundle build only.
- **This fix needs a new native build to reach real users.** The
  currently-live builds (iOS TestFlight #12, Android #73) don't have
  expo-updates compiled in yet (see the 2026-09-03 expo-updates note), so
  this JS-only fix can't ship via OTA until after the next native build -
  ironic timing, since that note is literally about enabling exactly this
  for future fixes. `front`'s half of this fix ships immediately via the
  CI/CD deploy workflow instead.
