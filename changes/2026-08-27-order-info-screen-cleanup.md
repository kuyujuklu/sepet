# Order screen: rate button fix, status clarity, missing checkout data

Date: 2026-08-27

## What & why

Client feedback on the order screen
([OrderInfo.jsx](../src/widgets/Orders/OrdersList/OrderInfo.jsx)): the "Оценить"
(rate) button next to "Повторить" (repeat) is visibly bigger and looks broken;
asked for a clearer icon on it too. Separately, asked to make the status/info area
more user-friendly and add any "must have" data currently missing.

Root cause of the button: the neighboring Repeat button is a padded, tinted pill;
`RateOrderButton` was a bare `TouchableOpacity` with no padding/background, *and*
was passed a larger `iconSize`/`fontSize` than Repeat's own icon/text at both call
sites (20/15 vs Repeat's 16/14 on this screen, 18/14 vs 15/13 on the orders list).
Its icon (`images.LikeDislikeBlack`, a thumbs up/down glyph) was also a poor fit for
a 5-star rating action.

Root cause of the status/info gap: the status was a flat colored badge only -
`not_handled` and `handled` rendered in the *identical* color, so a client couldn't
tell "just placed" from "the restaurant has seen it" apart, and there was no sense
of progress otherwise. Separately, the order is created with `comments`,
`main_phone_number`, `second_phone_number` and `payment_type` (`createOrder` in
`ordersApi.js`) - data the client entered at checkout - but none of it was ever
shown back on the order screen.

## Files

### Added

- `src/widgets/Orders/OrdersList/OrderStatusProgress.jsx` - a 5-segment horizontal
  bar under the status badge, filled green up to the current step
  (`getOrderStatusStep`). No text/icon of its own - the badge already names the
  stage, this only adds a sense of "how far along". Renders `null` for
  `canceled`/unknown status (not a point on that line).

### Modified

- `src/shared/utils/order-utils.js` - `getOrderStatusColors`: `handled` now gets its
  own color (indigo `#4338ca`/`#e0e7ff`) instead of reusing `not_handled`'s amber -
  the actual bug in the status mapping. New `getOrderStatusIcon(status)` (an
  Ionicons name per status) and `getOrderStatusStep(status)` (0-4 for the 5 linear
  statuses, `null` for `canceled`/unknown).
- `src/widgets/Orders/OrdersList/Star.jsx` - optional `size` prop (was hardcoded
  20×20); also dropped its unused native-base `View` import for the plain
  `react-native` one, matching the rest of the redesigned Orders widgets.
- `src/widgets/Orders/OrdersList/RateOrderButton.jsx` - rewritten. New `size`
  ("sm"/"md") prop with two presets that exactly mirror each call site's own Repeat
  pill numbers (`sm`: 15px icon/13px text/8px vertical padding = `OrderCard.jsx`'s
  `repeat` style; `md`: 16/14/9 = `OrderInfo.jsx`'s), replacing the old bespoke
  `iconSize`/`fontSize` props. Both the unrated state and the 5-star picker are now
  wrapped in the same pill shape as Repeat (`borderRadius: 16`, row, gap 6) but
  amber-tinted (`#fef3c7`/`#92400e` - the same tone already used for the
  `not_handled`/`handled` badges, no new color invented) instead of Repeat's green,
  so the button doesn't change footprint before/after tapping and sits at the same
  size as its neighbor. Icon swapped from `images.LikeDislikeBlack` (thumbs up/down)
  to an `Ionicons` `"star"` (the icon set already established elsewhere in the app -
  `DishSearchInput.jsx`, `ProfilePage.jsx`). Dropped native-base (`Spinner`, `Text`,
  `View`) for plain `react-native` (`ActivityIndicator` etc.) and a dead `Stars`
  import that was never used.
- `src/widgets/Orders/OrdersList/OrderCard.jsx` / `OrderInfo.jsx` - `RateOrderButton`
  calls now pass `size="sm"` / `size="md"` instead of the old props. Status badge
  gains an `Ionicons` icon before its text (`badge` style gained
  `flexDirection: "row", alignItems: "center", gap: 4`) - a free consistency win in
  the list, not just the detail screen. `OrderInfo.jsx` additionally: renders
  `OrderStatusProgress` under the status/date row; three new rows after the address
  (payment method, contact phone, comments), each rendered **only if the
  corresponding field is truthy on `order`** - see Backend gaps. The phone row is
  tappable (`Linking.openURL('tel:' + phone)`, same pattern as `PubInfoPopup.jsx`
  line 82). All three reuse existing locale keys already present in `ru.js`/`ro.js`/
  `gz.js` (`create_order_page.additional_data.inputs.{payment_type,
  main_phone_number, comments}.*`) - **no new locale strings were needed**.

## How it works

Nothing here depends on new data-fetching - `OrderInfo` already reads whatever is
currently in the redux `orders` slice for that id (websocket + pull-to-refresh, see
`changes/2026-08-27-pull-to-refresh.md`); the new rows just read three more fields
off the same `order` object, guarded by truthiness, so they render if-and-only-if the
API happens to include them.

## Backend gaps

- **missing data**: `payment_type`, `comments`, `main_phone_number` are sent to the
  backend on order creation (`ordersApi.js` `createOrder`) but whether the GET
  `/api/client/orders/` (or the websocket `GET_ALL`/`UPDATE_EVENT` payloads) echoes
  them back on the order object is **unconfirmed** - couldn't be verified from this
  environment (the endpoint needs a logged-in client's auth token). The new rows are
  purely defensive: if the field isn't there, the row just doesn't render, no
  regression either way. Worth a quick check with a real session to see if they
  actually show up.
- **missing data / API change needed**: delivery ETA, courier identity/contact, and
  a real status-history are still fully absent from the order object - carried
  forward unresolved from `changes/2026-08-26-first-screen-controls-orders-safe-areas.md`.
  No UI was built for these since there is genuinely nothing to show.

## Known limits / follow-ups

- Verified with `babel.parseSync` on every changed/new file and
  `npx expo export --platform ios` + `--platform android`. Not opened on a device -
  the pill sizing/amber tint and the new progress bar are worth a real look in hand.
- If `payment_type`/`comments`/`main_phone_number` turn out to never be present on a
  fetched order, the three new rows are dead code until the backend starts returning
  them - harmless, but worth revisiting once confirmed either way.
