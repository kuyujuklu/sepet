# Track push receive/open as regular analytics events

Date: 2026-09-03
Scope: `app` only.

## What & why

Firebase Console's "Messaging" report (Sends/Received/Impressions/Open count) showed
Sends: 667, Received: 4, Impressions: 1, Open count: 0. Investigated: this isn't a
rollout-timing gap that fixes itself as more clients update - it's structural. That
report's Received/Impressions/Open figures only come from Firebase's own native
Messaging SDK auto-instrumenting a notification it received directly
([confirmed via Firebase's docs](https://firebase.google.com/docs/cloud-messaging/understand-delivery):
"third-party push relays ... bypass Firebase's SDK measurement"). This app has no
`@react-native-firebase/messaging` - pushes go through `expo-notifications`, which
gets them via Expo's own push relay (`ExponentPushToken[...]`, see
`subscribeNotificationTokenOnServer`), never through Firebase's SDK. Sends is visible
because that's counted server-side at the FCM layer regardless of which client SDK
receives it; Received/Impressions/Open never will be, structurally, no matter how many
clients update.

Fix: track receive/open as regular `track()` calls instead, through the sink this app
already has wired to real Firebase Analytics (`firebaseAnalyticsSink.js`) - those don't
depend on Firebase's Messaging-specific auto-instrumentation, so they'll actually show
up (in the normal Analytics events view, not the Messaging report).

## Files

### Modified

- `src/shared/analytics/events.js` - two new keys: `pushReceived: "push_received"`,
  `pushOpened: "push_opened"`.
- `src/features/store/notifications/NotificationHandler.jsx` - added
  `trackPushReceived`/`trackPushOpened` helpers and called them from all three places
  a push is already observed:
  - `addNotificationReceivedListener` (app process alive, foreground or background) →
    `pushReceived`.
  - `addNotificationResponseReceivedListener` (tapped while the app process was
    already running) → `pushOpened` with `source: "warm"`.
  - `getLastNotificationResponseAsync` inside `checkInitialNotification` (app was not
    running - this tap is why it just launched) → `pushOpened` with
    `source: "cold_start"`.

## How it works

Both helpers read `notification.request.content.data?.type` for a `type` prop, if the
backend happens to send one - defensive optional chaining, so this is a no-op string
`null` rather than a crash if that field isn't there. Deliberately did **not** pass
`title`/`body` into the event props - `analytics.js`'s own rule is no PII in props, and
push copy here can carry order-specific text.

No new dedup logic: `pushReceived` and `pushOpened` are two different events for the
same underlying push (same as Firebase's own Received vs. Open concept), so they're
each tracked independently at their own call site - unlike
`appendNotificationToHistory`, which dedupes by identifier because it needs exactly one
history row per push regardless of how many listeners saw it.

## Backend gaps

None - purely client-side event tracking. The optional `type` field on the push
payload (`request.content.data.type`) is read defensively because it isn't confirmed
whether the backend actually sends one - worth checking with whoever owns
push-sending if per-type open rates turn out to matter.

## Known limits / follow-ups

- Not verified on-device - no build was made for this (per the user's standing
  "don't build bundles until I say so"); this will only show up in Firebase Analytics
  once whatever session tests it runs a real build. Verify by triggering a test push
  and checking Firebase Analytics' DebugView/events (not the Messaging report - see
  "What & why" above for why that one still won't move).
- Analytics has up to a real reporting delay before events are visible outside
  DebugView (same caveat noted in `2026-08-31-firebase-analytics-sink.md` for every
  other event in this catalogue).
