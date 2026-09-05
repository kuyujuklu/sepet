# Fix: campaign pushes could double-count "opened"

Date: 2026-09-05
Scope: `app` only. Paired with a backend change that makes campaign sends carry a
`deliveryID` in Data too (previously only individual notifications did).

## What & why

Backend now puts both `campaignID` and `deliveryID` in a campaign push's Data (see
backend's `2026-09-05` push work). `handleNotificationTap` was firing both
`markPushCampaignOpened({campaignID})` and `markNotificationOpened({deliveryID})` for
the same tap - two independent fire-and-forget mutations hitting two different
backend routes that both resolve to the *same* `PushCampaignRecipient` row and both
do a read-then-write ("already opened? no -> mark opened, increment count"). Nothing
serializes them client-side, so both requests could read "not opened yet" before
either one's write lands, incrementing `OpenedCount` twice for one tap.

## Files

### Modified

- `src/features/store/notifications/NotificationHandler.jsx` - `handleNotificationTap`
  now prefers `deliveryID` when present and only falls back to the
  `campaignID`-based call when it's absent (a campaign push sent before deliveryID
  existed on that path).

## How it works

Every push sent after both the app and backend changes ship carries `deliveryID`, so
in practice this makes the `campaignID` branch dead code for anything new - it stays
only so a campaign already in flight (or a delayed/retried delivery) from just before
the rollout doesn't lose its opened-tracking entirely.

## Backend gaps

None - this is purely picking one of two now-redundant signals instead of firing both.

## Known limits / follow-ups

- Not verified against a real double-tap/race in practice - the fix removes the
  structural cause (two concurrent writers) rather than being confirmed against an
  observed double-count in the wild.
