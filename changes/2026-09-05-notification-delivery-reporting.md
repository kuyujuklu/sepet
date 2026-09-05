# Report real push delivery/open back to the backend, not just analytics

Date: 2026-09-05
Scope: `app` (client-side); paired backend work in the same push-deliverability
investigation that started with `2026-09-05-fix-push-token-error-string-bug.md`.

## What & why

Backend now tracks individual order/status pushes the same way it already tracked
push-campaign sends (ticket -> Expo receipt -> delivered/undelivered), and every such
push carries a `deliveryID` (the tracking row's own id) in its Data payload. This adds
the app side: report back the moment the push is actually seen (`received`) and the
moment it's tapped (`opened`), against that id - a real, server-confirmed signal, not
just Expo's delivery receipt (which only confirms hand-off to APNs/FCM, not that the
device did anything with it) and not just the Firebase Analytics events from
`2026-09-03-push-receive-open-tracking.md` (which the backend/admin can't read back).

## Files

### Modified

- `src/shared/api/notifications-api/notificationsApi.js` - two new mutations,
  `markNotificationReceived`/`markNotificationOpened`, hitting the new
  `/client/notifications/{deliveryID}/received` and `.../opened` backend routes.
  Mirrors the existing `markPushCampaignOpened` pattern (fire-and-forget, no result
  handling needed).
- `src/features/store/notifications/NotificationHandler.jsx`:
  - `addNotificationReceivedListener`'s callback now calls `markNotificationReceived`
    when `notification.request.content.data.deliveryID` is present.
  - `handleNotificationTap` (shared by cold-start and warm-tap) now also calls
    `markNotificationOpened` when `data.deliveryID` is present, alongside the existing
    `campaignID`-based `markPushCampaignOpened` call.

## How it works

`deliveryID` and `campaignID` are independent, both-optional fields - a push can carry
either, both, or neither depending on what sent it and when. Individual order/status
pushes (backend's `notificationservice.go`) carry `deliveryID` now; push campaigns
still only carry `campaignID` (see backend gaps below) and keep using the existing
opened-tracking path. Both received/opened calls are fire-and-forget, matching every
other tracking call in this file - nothing here blocks or depends on them succeeding.

## Backend gaps

None outstanding for what this client change needs - the paired backend work already
shipped the routes and the recipient-row tracking for individual sends.

- API change already made, not yet extended: push campaigns don't carry `deliveryID`
  in their Data, only `campaignID` - so `markNotificationReceived` never fires for a
  campaign push, and campaigns' `ReceivedCount` column stays 0. Campaign sending
  batches all recipients through one `PublishMultiple` call and only learns each
  recipient's row id *after* that send (from `PublishMultiple`'s per-message
  response) - unlike the individual-notification path, which was reworked to create
  its tracking row *before* sending specifically so the id could ride along. Doing
  the same for campaigns means restructuring `SendCampaignNow`'s batch loop to
  create-then-send-then-finalize like `SendNotification` does; left as a follow-up
  since it touches already-proven, live sending code the campaign funnel already
  depends on today.

## Known limits / follow-ups

- Not verified on a real device/build - needs a live push with a `deliveryID` in its
  data to confirm the round trip end to end.
- Admin has nowhere to see individual-notification delivered/received/opened stats
  yet - `PushCampaignHistory.jsx`'s funnel is campaign-specific. The data exists
  (`PushCampaignRecipient` rows with `PushCampaignID = 0`) if a "personal
  notifications" summary card ever gets asked for.
