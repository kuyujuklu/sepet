# Analytics: fix dead basket_cleared, a double-fire bug, inconsistent payloads

Date: 2026-08-27

## What & why

Follow-up to an analytics audit done this session (found: no vendor wired at all -
`setAnalyticsSink` never called, so nothing reaches anywhere in production; no
stable client id; no consent gate - all noted as backend/product decisions, not
fixed here). Separately found three fixable bugs in the client-side event catalogue
itself, which this note covers:

1. `basket_cleared` was declared in `events.js` but never fired - the middleware had
   no case for the action that actually clears the basket.
2. `address_selected` was **double-firing** for 2 of its 3 real flows (picking a
   saved address, saving a new address) - once from the widget with `{source}`,
   once again from the redux middleware (which reacted to the same
   `geolocation/setGeolocation` dispatch) with an unrelated `{town}`. It also fired
   a *third*, spurious time from `CreateOrder.jsx` re-confirming the checkout
   address after a successful order - not a real "address selected" moment at all.
3. `feed_filter_changed` reused the same `filter` key for three different meanings
   across its three call sites: sometimes a filter *type* (`"free_delivery"`,
   `"pubs_sort"`), sometimes a filter *value* (`"top"`/`"deals"`/pub-filter). Not
   parseable as one consistent property server-side.

## Files

### Modified

- `src/features/store/analytics/analyticsMiddleware.js`
  - Removed the `geolocation/setGeolocation` case entirely (see bug 2). Every real
    address-selection call site already tracks itself with the context only it has
    (`source`); the middleware couldn't tell "user picked an address" from
    "checkout is re-confirming the address it already has" and was firing on both.
  - Added a case for `basket/doClearPopupConfirmingAction` (the action actually
    dispatched by `ClearBasketPopup.jsx`'s confirm button - not `basket/clearBasket`,
    which is only dispatched post-checkout as bookkeeping in `CreateOrder.jsx` and
    isn't a "cleared" event in the funnel sense). Reads `prevState` (captured before
    `next(action)` runs) to tell a genuine "Clear" tap on the basket screen apart
    from the "switch pub" confirm (adding a dish from a different pub, which also
    routes through this same popup/action) - only the former fires `basketCleared`,
    with `{pub_id, item_count}` from the basket as it was right before clearing.
    Reuses `getBasketCount` from `shared/utils/basket.js` instead of re-summing.
- `src/widgets/Geolocation/SelectFromPreviousGeolocations.jsx` /
  `SelectGeolocationInputs.jsx` - their existing `track(events.addressSelected, ...)`
  calls now also carry `town`, so all three real flows (`saved_list`,
  `current_location`, `new_address`) produce the same `{source, town}` shape.
- `src/widgets/TopDishes/FiltersSheet.jsx` / `SortSheet.jsx` / `TopDishesList.jsx` -
  `feed_filter_changed` payloads unified to `{filter_type, value}` across all three
  call sites (`free_delivery`/boolean, `pubs_sort`/sort key, `view`/tab filter).

## Backend gaps

None from this specific fix - the vendor/id/consent gaps from the earlier audit are
unchanged and still open (see this session's chat, not yet written up as a separate
note since no decision on a vendor has been made).

## Known limits / follow-ups

- Verified with `babel.parseSync` on every changed file and
  `npx expo export --platform ios`. Since production still has no real sink wired
  (`setAnalyticsSink` is never called), none of this is observable outside a dev
  build's console log today - correctness here was verified by reading each call
  site's logic, not by watching real events land anywhere.
- `category_selected` was flagged as possibly inconsistent in the initial audit pass
  too but turned out fine on closer read (`CategoriesCarousel.jsx` and
  `FiltersSheet.jsx` already send the identical `{category, screen}` shape) - no
  change needed there.
