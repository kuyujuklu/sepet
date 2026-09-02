# Pub open/closed status was going stale - refetch on open + gentle polling

Date: 2026-09-02
Scope: `app` only.

## What & why

Reported: a pub that was closed until some time never showed as open once that time
passed - had to leave the screen and come back. Root cause: `pub.isOpen` is computed
client-side from `getPubWorkHours(pub)` inside each query's `transformResponse`
(`src/shared/api/pubs/pubsApi.js`), which only runs once per actual network fetch, not
on every render - and `changes/2026-08-27-remove-background-polling.md` had removed
every `pollingInterval` in the app (for good reason - see that note) with no
replacement, so once a screen's initial fetch landed, `isOpen` was frozen until the
component unmounted and remounted (or a manual pull-to-refresh, on the three screens
that have it).

This isn't undoing that note - re-read the "Known limits" section at the bottom of it
first, it already flagged exactly this trade-off and suggested exactly this fix
("a much longer interval (2-5 minutes) would be a safer middle ground"). What's
different this time: a single consistent interval everywhere instead of mismatched
20s/60s across screens sharing one cache entry (the actual reason the old polling was
effectively firing every 10-15s, not 20s), and the pull-to-refresh spinner is now
explicitly decoupled from raw `isFetching` so a background poll can never make it flash
open on its own - the two list screens genuinely stay silent, not just "less noisy."

## Files

### Modified

- `src/widgets/TopDishes/useTopDishes.js` - `useGetTopDishesQuery` (the Home feed) and
  `useGetNearbyPubsQuery` (search + the `hasPubs` check) both got
  `refetchOnMountOrArgChange: 60` (refetch if what's cached is more than 60s old - the
  "at least when the screen opens" half of the ask) and `pollingInterval: 180000` (3
  min - the "or in the background" half). Added `isPullRefreshing`, a local flag set
  only inside `refetch()` (the pull-to-refresh callback) and cleared once whatever it
  kicked off settles; `isRefreshing` (feeds `TopDishesList`'s `RefreshControl`) now
  reads that instead of raw `feedIsFetching`, so the poll can't pop the spinner open on
  its own - only an actual pull can.
- `src/pages/Home/Home.jsx` - same two options on its own separate
  `useGetNearbyPubsQuery` call (used only for the `hasNoPubs` check, doesn't render a
  list, no spinner-decoupling needed here).
- `src/widgets/Pub/PubsList.jsx` (the establishments list - sorts open pubs before
  closed ones, so a stale `isOpen` here means a newly-opened pub also doesn't move back
  up) - same two options on both `useGetNearbyPubsQuery` and
  `useGetNearbyCategoriesQuery`, plus the same `isPullRefreshing` treatment since this
  screen's `RefreshControl` was also wired straight to raw `isFetching`.
- `src/pages/PubInfo/PubInfoPage.jsx` - `usePubInfo({ pubID, pubName })` call got
  `refetchOnMountOrArgChange: 60` only, deliberately **no** `pollingInterval`. This is
  the exact screen the 08-27 note called out for the worst symptom (the dish list
  itself re-fetching and re-rendering while someone is mid-scroll reading a menu) - the
  mount/arg-change check alone still fixes "walk into a pub page and it says closed
  when it just opened," without reintroducing a live timer over someone's shoulder
  while they're deciding what to order. `usePubInfo` is shared by several other
  screens/widgets (`BasketPage`, `CreateOrderPage`, `BasketFloatingBar`,
  `BasketCreateOrderButton`, `FullMenuList`, `DishListForCategory`, `CategoryList`,
  `LinkingWathcer`) - the option is only passed at this one call site, so none of them
  are affected; RTK Query shares the one underlying cache entry across all of them, so
  this call's refetch-on-mount check still freshens the data everyone else reads too
  the moment `PubInfoPage` itself mounts.

### Deliberately left untouched

- `BasketPage.jsx`, `CreateOrderPage.jsx`, `BasketFloatingBar.jsx`,
  `BasketCreateOrderButton.jsx` - none of `usePubInfo`'s other call sites got either
  option. The 08-27 note's reasoning for checkout screens specifically (price/status
  silently shifting while someone is paying) still applies and this request didn't ask
  for it there.

## How it works

`refetchOnMountOrArgChange: 60` is RTK Query's own mechanism: on mount, if the cached
data for this exact query is older than 60s, refetch; if it's fresher, just serve the
cache. `pollingInterval: 180000` sets a recurring background timer per subscribed
component, but RTK Query collapses it to one timer per unique cache entry (args) even
across multiple subscribers - which is exactly the mechanism that made the old
per-screen 20s/60s mismatch effectively fire every 10-15s (whichever subscriber asked
for the shortest interval wins for that shared entry). Every screen touched here now
asks for the same 180000, so that failure mode doesn't reappear.

## Backend gaps

None - purely a client-side re-fetch cadence change. The actual open/closed
computation (`getPubWorkHours`) already existed and is untouched.

## Known limits / follow-ups

- Not verified on-device yet - only `expo export --platform android` (module graph
  compiles) was checked. The user has a working iOS dev-client now (see
  `2026-09-02-expo-sdk-54-upgrade.md`) - worth actually watching a closed pub flip to
  open on Home/the establishments list without leaving the screen, and confirming no
  visible flicker during a poll.
- `isLoadingMore` (the bottom-of-list spinner for pagination) still reads raw
  `feedIsFetching`. If a client has scrolled past page 1 (`offset > 0`) exactly when a
  background poll fires, that spinner could flash briefly at the bottom - a poll
  re-fetches with whatever args are currently subscribed, including a non-zero offset,
  so this is possible in principle. Not fixed here: narrow window, low visual impact
  (bottom of a list they've scrolled past), not worth the extra state-tracking
  complexity unless it turns out to be noticeable in practice.
- 3 minutes was picked as the low end of the "3-4 minutes" the user asked for, safely
  clear of the 20s that caused the original problem. Not tuned further.
