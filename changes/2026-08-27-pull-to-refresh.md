# Pull-to-refresh: Home feed, establishments view, orders list

Date: 2026-08-27

## What & why

None of the app's lists supported the swipe-down-to-refresh gesture that is table stakes
for a feed-based app - flagged in the earlier UX audit this session. Added it to the three
places a client actually waits on live data: the Home dish feed, the "Все рестораны/
цветочные/продуктовые" establishments view (both, since they're the same shared
components regardless of which section is selected - "во всех разделах" falls out of that
for free), and the orders list.

## Files

### Modified

- `src/widgets/TopDishes/useTopDishes.js` — exposes `isRefreshing` and `refetch`.
  `refetch()` calls the nearby-pubs `refetch` *and* forces every per-pub `getPubInfo`
  fetch past its RTK Query cache (`forceRefetch`, gated by a ref so only the
  refresh-triggered run pays for it - see below). A `refreshIndex` counter was added to
  the menu-loading effect's deps purely to give pull-to-refresh a way to re-trigger it when
  the nearby-pub-id list itself hasn't changed.
- `src/widgets/TopDishes/TopDishesList.jsx` — `RefreshControl` on the dish `FlatList`,
  wired to the two values above.
- `src/widgets/Pub/PubsList.jsx` — its own `RefreshControl`; refetches both
  `useGetNearbyPubsQuery` and `useGetNearbyCategoriesQuery` (this view already runs
  entirely on its own pair of queries, independent of `useTopDishes`, which is skipped
  while this view is showing).
- `src/widgets/Orders/OrdersList/OrderList.jsx` — new `refreshing`/`onRefresh` props,
  passed straight to the `FlatList`'s `refreshControl` (only rendered when `onRefresh` is
  given, so nothing else calling this component needs to change).
- `src/widgets/Orders/OrdersList/OrderListWithAllClientOrders.jsx` — passes both props
  through unchanged.
- `src/pages/Orders/OrdersPage.jsx` — `useLazyGetAllOrdersForClientQuery` (was exported
  from `ordersApi.js` already, unused anywhere until now) drives the refresh; on success
  dispatches `setOrders` into the same `orders` redux slice the websocket already writes
  to, so `OrderCard`/`OrderInfo` needed no changes at all.

## How it works

**Home feed.** `forceRefetchRef` is set right before `refetch()` bumps `refreshIndex`, and
read-and-cleared the moment the effect runs. That means only the run caused by an actual
pull-to-refresh forces past the `getPubInfo` cache; the same effect re-running for an
ordinary reason (nearby pubs changed because the client moved, or the establishments view
got toggled off and back on) still reuses the cache like before. Without that guard, every
view-mode toggle would force a fresh network round trip for up to 8 pub menus - this way
only an explicit pull does.

**Orders list.** Orders normally arrive push-only, over the websocket
(`OrdersPreloader`/`orders-ws.js`) - there was no way to ask the server "send me the
current list again" over that connection (only `PONG` is ever sent client→server). The
`getAllOrdersForClient` REST query already existed in `ordersApi.js` with hooks generated
and exported, but nothing in the app called it. Pull-to-refresh is exactly that missing
caller: it hits `GET /api/client/orders/` directly and writes the result into the same
slice the socket writes into, so a refresh does not wait for the next push and the two
data sources never fight over rendering - only one ever populates the screen at a time via
the same action.

## Backend gaps

None - the orders REST endpoint the refresh needed already existed and was already wired
up client-side, just never called from anywhere.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and reading every changed
  file back; the actual gesture, spinner tint, and timing were not tested on a device or
  simulator.
- Assumed `getAllOrdersForClient`'s response shape is `{ ok, orders: [...] }`, matching
  every other list endpoint in this codebase (`get-available-pubs` → `pubs`, `get-pub-info`
  → `dishes`, etc.) - guarded with `Array.isArray(result.data?.orders)` so a wrong
  assumption fails quietly (refresh spinner still resolves, list just does not update from
  it) instead of crashing. Worth confirming against a real response once this runs on a
  device.
- The orders empty-state (no orders yet) is not itself a scrollable list, so it has no
  pull-to-refresh - not fixed here since the empty state already updates live over the
  websocket the moment a first order exists.
- Skeleton-loading branches (Home's full-page skeleton, establishments' `BigCardsSkeleton`)
  intentionally have no `RefreshControl` - pulling down before there is anything to pull
  down over is not a meaningful gesture yet.
