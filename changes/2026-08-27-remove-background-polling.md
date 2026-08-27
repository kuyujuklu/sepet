# Remove the 20s background polling causing visible reloads

Date: 2026-08-27

## What & why

Reported: the app appeared to "auto-refresh" every 10-15 seconds. Root cause: almost
every screen's RTK Query calls carried `pollingInterval: 20000` (some `60000`), and RTK
Query shares one cache entry per endpoint+args across every subscriber - so with several
screens each polling the *same* nearby-pubs/pub-info query at their own 20s cadence,
staggered starts made something refetch roughly every 10-15s in practice, not just every
20s from a single source.

On the pub menu screen specifically (`PubInfoPage`, `useGetPubInfoQuery` polling every
20s) this meant the whole dish list - the screen a client spends the most focused time
on, scrolling a menu - re-fetched and re-rendered on a timer while they were looking at
it. On Home, a poll changing `pub.distance` slightly (GPS jitter) could reorder
`nearbyPubs`, changing `useTopDishes`'s `nearbyPubsKey` and triggering a full re-fetch of
up to 8 pub menus - a much bigger reload than the poll itself.

Removing this now was safe to do outright because pull-to-refresh (added earlier today,
`changes/2026-08-27-pull-to-refresh.md`) already covers "I want fresh data" on the three
list screens - a manual pull, not a silent timer, is what actually re-fetches now.

## Files

### Modified — `pollingInterval`/`skipPollingIfUnfocused` removed from the query options

- `src/pages/Home/Home.jsx` — `useGetNearbyPubsQuery` (was 20000)
- `src/shared/hooks/useNearbyCategoryNames.js` — both `useGetNearbyCategoriesQuery` and
  `useGetNearbyPubsQuery` (was 20000 each) - shared by every screen that calls this hook
- `src/widgets/TopDishes/useTopDishes.js` — `useGetNearbyPubsQuery` (was 60000, but shared
  the same cache entry as Home's 20000 subscription, so it was effectively polling at 20s
  too - RTK Query polls a shared entry at the *shortest* interval any active subscriber asks for)
- `src/widgets/Pub/PubsList.jsx` — both nearby-pubs and nearby-categories queries (was 20000 each)
- `src/pages/Basket/BasketPage.jsx` — pub-info and nearby-pubs queries (was 20000 each)
- `src/pages/CreateOrder/CreateOrderPage.jsx` — same pair (was 20000 each)
- `src/pages/PubInfo/PubInfoPage.jsx` — nearby-pubs and pub-info queries (was 20000 each) -
  the one driving the menu-screen reload described above
- `src/widgets/Basket/BasketCreateOrderButton.jsx` — pub-info query (was 20000)
- `src/widgets/Orders/useRepeatOrder.js` — nearby-pubs query (was 20000)

### Deliberately left untouched

- `src/features/store/version/VersionWatcher.jsx` — 300000 (5 min), checks for a forced
  app update. Not what anyone would perceive as "every 10-15 seconds," and unrelated to
  the reported symptom.
- `src/widgets/Maps/PubsMap.jsx`, `src/widgets/Pub/PubList.jsx`,
  `src/widgets/Promotions/PubPromotions.jsx` — confirmed (repo-wide import grep) that
  nothing renders any of these three; they're dead code left over from earlier reworks
  (`PubsMap`/`PubList` since Home dropped the map, `PubPromotions` since the promotions
  feature was disconnected - see `changes/2026-08-24-orphaned-promotions-files.md`).
  Their polling still exists on paper but never runs, so touching them would be a no-op
  change to code nobody executes.

## How it works

Every RTK Query hook above still fetches once on mount (and again if its `args` change,
e.g. `pubID`/coordinates) - that behavior is untouched, only the recurring background
timer is gone. Data now goes stale until the screen remounts (leaving and coming back) or,
on the three screens that have it, the client pulls to refresh.

## Backend gaps

None - purely a client-side fetching-cadence change.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and reading every changed
  file back; the actual before/after feel on a device was not measured.
- This trades background freshness for stability: a pub that closes or a price that
  changes while a client is sitting on `PubInfoPage`/`BasketPage`/`CreateOrderPage` will no
  longer update on its own until they leave and come back. That is very likely the right
  trade for a menu/checkout screen (a timer silently changing what is on screen while
  someone is reading it or paying is its own kind of bug), but flagging it explicitly in
  case "the price should still update automatically at checkout" turns out to matter more
  than the reload flicker.
- If background freshness for a *specific* screen turns out to still be wanted (e.g. pub
  open/closed status during a long checkout), a much longer interval (2-5 minutes, matching
  `VersionWatcher`'s cadence) would be a safer middle ground than reintroducing 20s polling.
