# Register push token before login, not just after

Date: 2026-09-05
Scope: `app` (client-side); paired backend work makes the same call site work when
`phone` is empty.

## What & why

The app's home feed/menus are all browsable without logging in (`App.js`'s
`initialRouteName` is `SectionPicker`/`Home`, not `Authentication`) - login only
happens later, usually at checkout. But `NotificationHandler.jsx`'s subscribe effect
required `client` (the authenticated session) before it would call
`subscribeNotificationTokenOnServer` at all, so anyone who never logs in - and, per
prod data checked in this investigation, a large share of clients never place an
order at all - could never receive a push, structurally, no matter how long they used
the app or how many times they opened it.

Discussed switching push providers (Firebase, OneSignal) to fix this - the actual gap
was app-only logic tying subscription to login, not anything about Expo's own
push service; same fix works on Expo, no migration needed.

## Files

### Added

- `src/shared/utils/deviceId.js` - `getOrCreateDeviceId()`: a UUID generated once via
  `react-native-uuid` and persisted with `expo-secure-store` (same persistence
  mechanism `authBasedQuery.js` already uses for the refresh token), stable across
  logins/logouts on that install.

### Modified

- `src/shared/api/notifications-api/subscribe-token.js` -
  `subscribeNotificationTokenOnServer` takes a new `deviceId` param, sent as
  `device_id` in the request body.
- `src/features/store/notifications/NotificationHandler.jsx` - the subscribe effect no
  longer bails out when `client` is falsy; it only needs `expoPushToken` and
  `i18n.language` now. Resolves `getOrCreateDeviceId()` and sends
  `client?.phone` (undefined when logged out) alongside it.

## How it works

The device id is what makes an anonymous subscription findable again if/when the
person does log in on that same device: the backend looks the row up by `device_id`
first and fills in the real client id in place, rather than a login creating a second,
duplicate row for the same install. See the paired backend change
(`notificationservice.Subscribe`) for the actual linking logic - nothing here needs to
know whether it's creating a new row or upgrading an existing one, it just always
sends `phone` (however much of it is known) + `deviceId` + token + lang.

## Backend gaps

None outstanding - the paired backend change already accepts an empty `phone` and
handles the anonymous/upgrade cases via `device_id`.

- Existing gap, unaffected by this change: push campaigns' audience resolution
  (`ResolveAudienceClientIDs`) only ever looks at `orders.client_id` - an anonymous
  subscription (no client behind it yet) has no orders, so no audience segment can
  target it today, campaign or otherwise. Reaching not-yet-registered installs (e.g. a
  "come back and finish signing up" nudge) would need a new audience type built
  server-side; this change only makes the *subscription* possible, not a way to
  target it from the campaign composer yet.

## Known limits / follow-ups

- Not verified on a real device/build - the interesting case (open the app fresh,
  never log in, confirm a subscription row appears with `client_id = 0`) needs a
  clean install to test, not just re-running in an already-logged-in dev session.
- `expo-secure-store` failing (rare, but possible on some Android configurations)
  would make `getOrCreateDeviceId()` regenerate a new id every call instead of
  persisting - not handled specially; worst case is a client's subscription can't be
  found/upgraded by device id and behaves like a pre-this-change app build once they
  do log in (falls back to the phone-only path server-side).
