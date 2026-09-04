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

## 2026-09-04 (same day, later) - real root cause: a second, backend bug

User reported the free-delivery display bug again, but this time **inside**
a zone with a price the admin had genuinely set - not the outside-zone case
above at all. Traced to `backend/src/services/pubservice/pubsservice.go`:
`GetShippingPricesForPubAvailableForPoint` (feeds the app/front display) and
`GetDeliveryPriceForLatLng` (feeds real order pricing, via
`orderservice.go`'s `GetRealDeliveryPricesForOrder`) both matched the
point's zone (`shape_id`) correctly, then looked its price up with
`for shapeID, shapePrice := range pubShippingPrices { if shapeID == ... }` -
a loop that leaves `price` at its Go zero-value (`0`) both when the zone
generally has no price recorded (`ShippingPricesJSON` never saved for that
`shape_id`) and when it genuinely has a saved price of `0`. Those two cases
are indistinguishable that way, and the zone still reads as `isAvailable`,
so a zone whose price was never saved silently priced as free - for the
*display* (this bug report) and, worse, for *real orders* too.

How a zone ends up with no saved price despite looking configured in the
admin: `admin-front`'s shipping tab has two independent save actions -
`Map.jsx`'s "Сохранить все" persists `ShapesJSON` (drawing a new zone),
`DeliveryPriceInput.jsx`'s own save button persists `ShippingPricesJSON`
separately. Saving the first without the second leaves a zone that is
fully "available" with no price ever written for it.

### Fix (`backend` only, not yet committed/deployed - see repo note below)

Both functions now use a two-value map lookup (`price, hasPrice :=
pubShippingPrices[shapeID]`) and treat `!hasPrice` as "not available",
same as a point outside every zone:
- `GetShippingPricesForPubAvailableForPoint` returns `(false, 0, 0, nil)` -
  same shape as the existing out-of-zone case, so `pub.go`'s caller (which
  turns any *error* return into a hard failure of the whole pub-info
  response) is untouched; this still just flips `shipping.available` to
  `false`, which the app-side fix above already renders correctly.
- `GetDeliveryPriceForLatLng` returns `puberrors.ErrLocationNotInDeliveryZone`
  - reusing the existing out-of-zone error, already mapped to HTTP 400 and
  already handled by order creation/preview as a hard reject.

An explicitly-saved price of `0` (admin wants genuinely free delivery in
that zone) is unaffected - that's a present map key, not an absent one.

### Backend gaps

None new - this closes a gap, doesn't create one. Worth a follow-up in
`admin-front` at some point: nothing currently warns an admin that a
newly-drawn zone has no price yet, so the two-step save is easy to miss
silently again. Not done now - out of scope for this bug fix.

### Status

Fixed, compiles (`go build ./...`), committed (`03a9210`) and pushed to
`backend` on both remotes (`origin` = kuyujuklu/sepet.git, `alexkalak-origin`
= alexkalak/qrmenu - the one `deploy-backend.yml`'s Docker Hub/SSH secrets
actually live on) per explicit user instruction. Not deployed - that
workflow is `workflow_dispatch`-only, so it still needs a manual "Deploy
backend" run from the Actions tab on `alexkalak/qrmenu`. Since this is a
pure backend fix, it does **not** need an app rebuild to take effect once
deployed - unlike the outside-zone half of this bug above.

## 2026-09-04 (same day, even later) - require a confirmed address before checkout

User asked to port the website's address-picking behavior into this app.
Comparing the two: `sepet.md` (`front/app/shared-components/LocationPicker/`)
never has an unconfirmed-location state at all - it removed its old
pick-a-city fallback outright, per the client's own call, specifically so
every address the site handles carries a precise, deliberately-placed
coordinate. This app already has the equivalent machinery
(`SelectGeolocation.jsx`'s drag-the-map-not-the-pin picker,
`SelectGeolocationInputs.jsx`'s reverse-geocoded town/street fields - both
pre-existing, not new here) and even the right Redux modeling
(`geolocationSlice.js`'s `isApproximate` flag, `setApproximateGeolocation`
vs `setGeolocation`, with a comment already saying *"Checkout has to ask for
the real one"*) - it just was not actually enforced anywhere. An approximate
point (silent device GPS, shown on the home feed as "Определено по
геолокации", never run through the map picker) fed pricing exactly the same
as a confirmed one; `CreateOrder.jsx` only ever showed a small, skippable
"approximate location" caption next to the submit button. This is the same
class of imprecision behind the free-delivery-at-a-zone-edge report above -
closing it here is the systemic fix, not just today's specific case.

### Fix

Both checkout entry points now block on `isApproximate` (reusing
`selectIsApproximateGeolocation`, unchanged) the same way they already block
on a closed pub or an unavailable zone - alert + redirect to
`SelectGeolocationPage`, no order attempted:
- `widgets/Basket/BasketCreateOrderButton.jsx` - new `isApproximateLocation`
  prop, checked in the tap handler right after the existing
  `isPubOpen`/`isAvailableForDelivery` guard.
- `pages/Basket/BasketPage.jsx` - reads `selectIsApproximateGeolocation`,
  passes it down.
- `widgets/Orders/CreateOrder/CreateOrder.jsx` - `sendData()` already had the
  selector (for the caption) but never branched on it; added right after the
  existing "no coordinates at all" guard, same shape. Belt-and-suspenders
  with the basket-level check above - this screen is also reachable from
  repeat-order, so it needs its own gate rather than trusting the caller.

Reused `create_order_page.additional_data.approximate_location` for both
new alerts instead of adding a translation key - same underlying fact
("we don't actually know where this goes yet"), now surfaced as a hard stop
instead of a caption.

### Backend gaps

None - purely a client-side gate on data the app already had.

### Known limits / follow-ups

- Not verified on-device (standing constraint) - verified via
  `expo export --platform ios`.
- Only the two order-submission entry points are gated. Browsing/adding to
  basket on an approximate location is still allowed (matches this app's own
  existing `setApproximateGeolocation` comment - "so that the product
  screens can be shown right away"), unlike the website, which never has an
  unconfirmed state at all. Gating earlier too is a bigger UX change than
  asked for here; revisit if approximate-location pricing keeps surfacing
  bugs even with this fix in place.
- Needs a new native build to reach real users, same as every other change
  in this file - can't ship via OTA yet (expo-updates isn't in the
  currently-live builds).
