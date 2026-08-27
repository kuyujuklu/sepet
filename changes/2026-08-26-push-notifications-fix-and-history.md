# Push notifications: found why they were partially broken, added a notifications history

Date: 2026-08-26

## What & why

Two asks: pushes "partially didn't work" and Expo showed a push-related error/warning;
separately, add a place under Профиль → Дополнительные настройки where received pushes
accumulate so the client can look back at them.

## The root cause of the partial failure (infra, not fixed by this session)

**Strong evidence, not yet confirmed live** (`eas credentials` is a fully interactive
menu-driven command; this sandbox's shell has no TTY, so it refuses even to read a
piped answer — "Input is required, but stdin is not readable" — so this could not be
verified end-to-end this session):

- Google shut down the **legacy FCM (Cloud Messaging) HTTP API in June 2024**. Since then,
  Expo's push service requires **FCM V1** credentials for Android: a Firebase service
  account JSON uploaded via `eas credentials`. A project that never did this migration has
  Android pushes fail outright while iOS (APNs, unrelated to this) keeps working — exactly
  a "partially" broken symptom.
- `eas.json` had `"promptToConfigurePushNotifications": false` in the `cli` block. This is
  the flag that silences EAS CLI's own build-time prompt ("push notifications aren't set
  up for this project, configure them now?"). Finding it explicitly set to `false` is a
  strong signal someone hit that exact prompt/warning and suppressed it instead of acting
  on it - **removed it** in this session so the build surfaces the real problem again
  instead of hiding it.
- The repo already has `sepet-app-firebase-adminsdk-o45yd-7f7bc75811.json` sitting in the
  project root - a Firebase **service account** key (Project Settings → Service Accounts →
  Generate new private key), which is exactly the file type FCM V1 needs. It looks
  downloaded-but-never-uploaded.

**What still needs to happen, by someone with an interactive terminal** (this could not be
driven from here):

```
npx eas credentials --platform android
```

→ select the build profile → Push Notifications → set up / replace the FCM V1 service
account key, pointing it at `sepet-app-firebase-adminsdk-o45yd-7f7bc75811.json` (verify
first, in the Firebase console, that this service account still has the "Firebase Cloud
Messaging API" role - default Admin SDK accounts do). After that, a new build should be
tested with a real push against `Notifications.getExpoPushTokenAsync` on an Android
device.

## Files

### Added

- `src/features/store/notifications/notificationsHistorySlice.js` — `{ items: [] }`,
  `setNotificationsHistory`, `selectNotificationsHistory`,
  `selectUnreadNotificationsCount`. Not persisted itself - hydrated from AsyncStorage by
  `App.js` on launch, same pattern as `saved_addresses`/`geolocationSlice`.
- `src/shared/utils/pushNotificationsHistory.js` — the AsyncStorage side, mirroring
  `shared/utils/savedAddresses.js`'s shape: `readNotificationsHistory`,
  `appendNotificationToHistory(dispatch, notification)` (dedupes on
  `notification.request.identifier`, caps the list at 100),
  `markNotificationsHistoryRead(dispatch)`, `clearNotificationsHistory(dispatch)`.
- `src/pages/Notifications/NotificationsPage.jsx` — Профиль → Дополнительные настройки →
  Уведомления. List of received pushes, newest first, unread dot, "Очистить историю" link,
  empty state. Marks everything read as soon as the screen opens (`unreadCount > 0` effect).

### Modified

- `src/features/store/notifications/NotificationHandler.jsx` — real bug fixed: it called
  `subscribeNotificationTokenOnServer()` **with no arguments** on every mount (line 93,
  before the token/client/language were even known), POSTing
  `{phone: undefined, token: undefined, lang: undefined}` to
  `/api/client/notifications/subscribe` on every app start - pure dead traffic, removed.
  The real, correctly-parameterized call (once `client` + `expoPushToken` + `i18n.language`
  are all ready) was already there and is unchanged. Also now calls
  `appendNotificationToHistory` from all three places a notification becomes known:
  foreground receive, the user tapping one while the app is running, and
  `getLastNotificationResponseAsync()` on a cold start from a killed state. Dropped unused
  `Text`/`View`/`Button` imports (the component always rendered `<></>`).
- `src/features/store/configureStore.js` — registered `notificationsHistory` reducer.
- `App.js` — hydrates the notifications history from AsyncStorage on launch (next to the
  existing `lang`/`saved_addresses` loads); registered `Screens.Notifications` →
  `NotificationsPage`.
- `src/app/navigation/screens.js` — added `Notifications`.
- `src/pages/Profile/ProfilePage.jsx` — new "Дополнительные настройки" section with one
  row, an unread-count badge (green pill, hidden at 0). `ProfileRow` gained an `iconNode`
  prop (a vector glyph instead of the usual `images.*` raster icon - there is no bell icon
  in `assets/images`, and `@expo/vector-icons` is already a dependency used elsewhere in
  the auth screens) and a `badge` prop (small count pill before the chevron).
- `assets/locales/{ru,ro,gz}.js` — `profile.additional_settings`, `profile.notifications`,
  `notifications_page.{title,empty,clear}`. ro/gz are my approximations, need a native
  check like every other ro/gz addition in this repo.
- `eas.json` — removed `cli.promptToConfigurePushNotifications: false` (see above).

## How it works

A push notification becomes an entry in the history the moment expo-notifications tells
the app about it, through whichever of the three listeners fires first - foreground
receive, a tap while the app is alive, or the cold-start check. All three funnel through
`appendNotificationToHistory`, which dedupes on the notification's own `request.identifier`
so a tapped notification (which fires both "received" and "response" in some states) is
never recorded twice. The record itself is `{id, title, body, data, receivedAt, read}` -
`data` is kept (not currently rendered) so a future "tap to navigate" feature has
something to read.

Storage is a flat AsyncStorage array under `push_notifications_history`, capped at 100
entries on write - there is no backend notification inbox to page through, this is
client-only and needs a ceiling. Redux only ever mirrors whatever was last written to
storage (`setNotificationsHistory` is the one reducer); every mutation
(append/mark-read/clear) writes storage first and dispatches second, same order
`appendSavedAddress` already used.

## Backend gaps

- `missing data` — there is no server-side notification history at all; a client that
  reinstalls the app (or clears storage) loses every past push. If notifications should
  survive that, the backend needs its own inbox endpoint
  (`GET /api/client/notifications`) the client can page through instead of/alongside the
  local cache.
- Unrelated to notifications, noticed in passing: `credentials.json` in the repo root
  holds the Android **keystore password and key password in plaintext**. This project is
  not a git repo today, so it is not published anywhere, but it is worth moving those two
  values to `eas credentials`-managed remote storage (the default) rather than a local
  file, before this ever does become one.

## Known limits / follow-ups

- The infra fix (uploading the FCM V1 service account) is **not done** - it needs an
  interactive `eas credentials` session, which this sandbox cannot drive (confirmed: it
  refuses to even read piped stdin, "Input is required, but stdin is not readable").
  Someone needs to run the command above themselves.
- Tapping a notification in the history list does nothing yet (`data` is stored but not
  acted on) - the obvious next step once there is somewhere meaningful to navigate to
  (e.g. `data.orderID` → `OrderInfoPage`).
- Not tested on a device this session - the whole notifications feature is unverified
  beyond `npx expo export` (module graph resolves/compiles) and reading every file back.
  Worth a manual pass once Android push is actually delivering: confirm a foreground push
  shows up in the history immediately, a background tap does too, the unread badge clears
  on opening the screen, and "Очистить историю" actually empties both AsyncStorage and the
  badge.
