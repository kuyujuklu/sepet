# Fix: stringified registration error stored and sent as the push token

Date: 2026-09-05
Scope: `app` (client-side fix); paired backend fix in the same investigation adds
subscribe-time validation on both `backend`'s client and courier endpoints.

## What & why

Asked to check why a push campaign's delivery numbers looked low. Queried prod:
one campaign sent, 1637 recipients, 1545 failed at Expo's own send-time validation
(94.4%), only 3 confirmed delivered via receipt. Sampled the `expo_token` values
behind the failures - not stale/malformed real tokens, literal error strings:
`"Error: Permission not granted to get push token for push notification!"`,
`"Error: Error: Fetching the token failed: ... TOO_MANY_REGISTRATIONS"`.

Root cause: `NotificationHandler.jsx`'s effect chained `.catch((error) =>
setExpoPushToken(\`${error}\`))` on `registerForPushNotificationsAsync()`. Any
rejection from that function (an exception thrown outside its own inner try/catch -
`getPermissionsAsync`/`requestPermissionsAsync` throwing, `setNotificationChannelAsync`
throwing on Android, including the FCM `TOO_MANY_REGISTRATIONS` case seen in the
sample) landed here, and the stringified error was stored as `expoPushToken` state.
The subscribe effect only guards on `!expoPushToken` (falsy check) - a non-empty
error string sails through and gets sent to `/subscribe` as if it were real.

This is not the same issue as `2026-09-03-push-receive-open-tracking.md` (Firebase's
Messaging report structurally can't see Expo-relayed pushes) - that one is a
measurement blind spot with real delivery underneath; this one is real subscriptions
that were never valid tokens in the first place, so every future send to them was
always going to fail before Expo even tries to deliver.

## Files

### Modified

- `src/features/store/notifications/NotificationHandler.jsx` - the `.catch` now logs
  the error and resets `expoPushToken` to `''` instead of storing the error's string
  form, so the existing `!expoPushToken` guard actually blocks it from ever reaching
  `subscribeNotificationTokenOnServer`.

## How it works

`registerForPushNotificationsAsync`'s own try/catch only wraps the
`getExpoPushTokenAsync` call; permission-related calls above it can still throw and
reject the outer promise. The fix doesn't change that function - it fixes what the
caller does with a rejection: never treat "registration failed" as "here is a token".

## Backend gaps

None outstanding for this bug - paired fix in `backend` (client and courier
`/notifications/subscribe`) now rejects any token failing `expo.NewExponentPushToken`'s
own shape check (same check Expo's SDK does before actually sending), so even a future
client-side regression like this one can't poison the subscriptions table again.

## Known limits / follow-ups

- Existing poisoned rows in `notification_subscriptions` (prod) were not cleaned up -
  this fix only stops new ones. A one-off `DELETE ... WHERE expo_notification_token
  NOT LIKE 'ExponentPushToken%'` (or re-validate through the SDK's check) would clear
  the backlog; left as a data change for whoever owns prod access to run deliberately.
- Not verified on a real device build yet - the actual throw paths (permission request
  itself throwing, Android FCM TOO_MANY_REGISTRATIONS) are hard to trigger on demand;
  the fix is verified by code inspection and the reproduced production data, not a
  live repro.
