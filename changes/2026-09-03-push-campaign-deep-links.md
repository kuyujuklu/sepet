# Push campaigns: tap-to-navigate, dish popup, opened tracking, external links

Date: 2026-09-03
Scope: `app` (this note) + a small `backend` addition (campaignID on the push payload,
documented here since the app change depends on it - no `app`-side gap otherwise).

## What & why

The superadmin panel got a new "push campaign" composer/history feature today (backend +
admin-front, not this repo). It can target five deep-link kinds - pub, order, dish, a bare
app screen, or an external URL - and needs a tap to report back as "opened" for its history
funnel. Before this, `NotificationHandler.jsx` recorded history and analytics on a tap
(added earlier today, see `2026-09-03-push-receive-open-tracking.md`) but never actually
looked at the notification's `data` to navigate anywhere - the comment
`// You can navigate or handle data here` marked the exact gap. Of the five kinds, two
(pub, bare screen) already worked with zero changes here once wired up, since
`resolveDestinationFromFields` already handled them; order needed nothing new either. Dish
and external-URL genuinely didn't exist as capabilities and needed new code.

## Files

### Added

- `src/shared/api/notifications-api/notificationsApi.js` - one RTK Query mutation,
  `markPushCampaignOpened({campaignID})` → `POST /api/client/push-campaigns/:id/opened`.
  Separate from `subscribe-token.js` (plain `fetch`, no auth) because this needs the
  client's access token, so it goes through `authenticationBasedQuery` like every other
  authenticated call in the app instead of reimplementing that by hand.

### Modified

- `src/features/store/notifications/NotificationHandler.jsx` - the actual wiring:
  - New `handleNotificationTap(notification)`, called from both places a tap is already
    observed (`checkInitialNotification`'s cold-start path and
    `addNotificationResponseReceivedListener`'s warm path) - previously neither did
    anything with the data.
  - `data.campaignID` present → fires `markPushCampaignOpened`, fire-and-forget, before
    anything else. Present on every campaign push regardless of its deep-link type (or
    lack of one); absent on the order-status pushes the backend already sent before this
    feature existed, so those never call it.
  - `data.externalUrl` present → `Linking.openURL(data.externalUrl)` (from `react-native`
    core, matching `PubInfoPopup.jsx`'s existing `tel:` link - not `expo-linking`, which
    this file didn't previously import and which is used elsewhere in the app for
    *parsing* incoming links, not opening outgoing ones).
  - `data.path === "DishInfo"` (with `pubID`+`dishID`) → new `pendingDishLink` state +
    a `usePubInfo` call gated on it; see "How it works".
  - Otherwise → `resolveDestinationFromFields(data)` (unchanged) + `navigation.navigate`.
    `useNavigation()` is new here; `NotificationHandler` is already mounted directly
    inside `<NavigationContainer>` in `App.js` (sibling of `LinkingWathcer`), so this
    needed no ref-forwarding setup, just the hook.
- `src/shared/utils/deepLink.js` - **not modified**. Deliberately: its contract
  (`{path, pubID, pubName, orderID}` → `{screen, params}`) doesn't fit a dish, which has
  no screen of its own (dishes open via the global `DishImagePopup`, never a route) - see
  `resolveDestinationFromFields`'s doc comment, still accurate. Bolting an async,
  dispatch-based case onto a function `LinkingWathcer`/`App.js` also call would have
  changed its contract for callers that don't need it. Handled entirely inside
  `NotificationHandler` instead.
- `src/features/store/configureStore.js` - registered `notificationsApi`
  (reducer + middleware), same pattern as every other RTK Query slice here.

### Backend (separate repo, not covered by this file's own changes/ convention)

- `pushcampaignservice.go`: `buildDeepLinkData` → renamed `buildPushData`, now always
  includes `campaignID` (when the campaign is a real persisted one - `SendTest`'s
  throwaway campaign literal has `ID 0` and deliberately gets none, since a test tap has
  nothing to report against). Found this gap while writing the app side: the original
  function only ever populated deep-link fields, so the app had no id to post back
  against no matter what got built here.

## How it works

**Dish popup.** `DishImagePopup` is a global popup (mounted once in `App.js`, opened via
redux from anywhere - see this repo's `CLAUDE.md`), not a screen, and needs the actual
`dish` object plus its `pub` (for `getDishPrices`), not just two ids. So a dish tap can't
resolve synchronously the way pub/order/screen do:
1. `setPendingDishLink({pubID, dishID})`.
2. `usePubInfo({pubID: pendingDishLink?.pubID}, {skip: !pendingDishLink})` - the *same*
   hook `PubInfoPage`/`LinkingWathcer` use, so this shares their cache entry rather than
   opening a second, coordinate-less one (per `usePubInfo`'s own doc comment).
3. An effect watches `pendingPubData`; once `.pub` and `.dishes` are both in, it finds the
   dish by id (`pendingPubData.dishes.find(d => d.id === dishID)` - confirmed exact shape
   by reading `FullMenuList.jsx`, which reads pub info the same way), clears
   `pendingDishLink` (so this runs once), and if found:
   `navigation.navigate(Screens.PubInfo, {pubID})` **then** `dispatch(openDishImagePopup(...))`
   - navigates there first so dismissing the popup lands on that dish's actual menu
   (matching every existing call site, e.g. `DishRow.jsx`'s `openDetails` - always
   triggered from already being on that pub's page) instead of wherever the tap happened
   to catch the user (mid-checkout on a *different* pub, mid-basket, etc).
4. If the dish isn't found (removed/stale), it silently does nothing further - already
   navigated nowhere at that point, nothing sensible to show.
   `openDishImagePopup`'s payload shape (`imagePath`, `dish`, `dishID`, `pubID`,
   `commission`, `isAvailableForDelivery`, `isPubOpen`, `isDishAvailable`) copied exactly
   from `DishRow.jsx`'s own dispatch call, `commission` from `getDishPrices(dish, pub)`,
   `isAvailableForDelivery`/`isPubOpen` from `pendingPubData.pub` (same fields
   `usePubInfo`'s `transformResponse` already computes, that `DishRow` normally gets
   via props from whichever screen loaded it).

**Screen picker (superadmin side, not this repo, noted for context).** The composer's
"Экран приложения" dropdown only offers `Home/Orders/Basket/Profile/Notifications/
SectionPicker` - a deliberate subset of the app's real `Screens` enum, excluding
auth/error/onboarding screens a signed-in, up-to-date user should never be pushed to.

## Backend gaps

- **`campaignID` was missing from the push payload entirely** (`API change needed` -
  already fixed today, see "Files" above) - without it there was no way for a tap to say
  which campaign it belonged to, so "opened" tracking could never have worked regardless
  of anything done in this repo.
- **No receipt data reaches the client at all**, and doesn't need to - "delivered" is
  tracked server-side by polling Expo directly (per that feature's own backend notes).
  Nothing missing here, just noting it so a future session doesn't go looking for a
  client-side piece that was never supposed to exist.

## Known limits / follow-ups

- **Not verified on-device** - same standing constraint as every other push-notification
  change in this repo (per the user's "don't build bundles until I say so"; see the
  09-03 receive/open-tracking note for the same caveat). Verified instead by reading
  every touched function's real current source before writing against it (`deepLink.js`,
  `screens.js`, `App.js`'s `<Stack.Navigator>` registration, `usePubInfo.js`,
  `pubsApi.js`'s `getPubInfo`, `dishesSlice.js`'s reducer, `DishRow.jsx`'s exact dispatch
  call, `dish.js`'s price/image helpers) and a full `npx expo export --platform ios`
  production bundle build (needed `NODE_OPTIONS=--max-old-space-size=6144` in this
  sandbox - the default heap OOM'd partway through Metro's bundling, unrelated to any of
  this) - confirms the whole module graph resolves and compiles, not that the runtime
  behavior is correct on a real phone.
- **External URL always opens the system browser**, never in-app - there is no WebView
  screen in this app yet (confirmed: `react-native-webview` is an installed-but-unused
  dependency, grepped repo-wide). Fine for v1; revisit if a campaign ever wants to keep
  the client inside the app for a URL.
- **A pub fetch failure leaves `pendingDishLink` set forever** (the effect's guard never
  clears it on error, only on success) - inert, not a crash, just a stale bit of state
  until the app restarts. Not worth a retry/timeout for how rarely this fires; flagging
  in case it's ever worth revisiting.
- The composer's dish picker (admin-front side) already tells the superadmin this doesn't
  resolve on the app yet, in case this note and that UI ever drift out of sync - now they
  agree.
