# Skip the section picker on a cold-start deep link

Date: 2026-08-26

## What & why

A cold start from a deep link (the client's real primary entry point besides the app
icon — a pub link shared from the web, `sepet.md/pub/...`) still mounted
`SectionPickerPage` first and only navigated away from it inside a `useEffect`. That is
one full render (plus, on Android's first frame, sometimes more) of "Что закажем?" with
its logo and three cards, visible before the redirect to the actual pub kicks in — a
flash on the app's most common opening path, not an edge case.

Fix: resolve the deep link **before** `Stack.Navigator` ever mounts, so the picker is
never part of the tree for that launch. `Screens.SectionPicker` stays the app's default
`initialRouteName`; a resolved deep link overrides it for that one launch.

## Files

### Added

- `src/shared/utils/deepLink.js` — `parseDeepLink(url)` (pulled out of
  `LinkingWathcer`'s inline parsing, unchanged in behavior), `resolveDestinationFromFields`
  (the `{path, pubID, pubName, orderID} → {screen, params}` rule, previously duplicated
  inside `useLinkedDestination`), and `resolveDeepLinkDestination(url)` = the two
  composed. All three are plain functions with no React/redux dependency, so they can run
  during the very first render of `App.js`, before any provider state exists.

### Modified

- `App.js` — `Linking.useLinkingURL()` (not `useURL()`) read once at the top of
  `AppInner`. Unlike `useURL()`, which resolves the initial URL through an async native
  call (`RNLinking.getInitialURL()` → a Promise), `useLinkingURL()`'s initial state comes
  from `ExpoLinking.getLinkingURL()`, a **synchronous** native `Function` (see
  `node_modules/expo-linking/ios/ExpoLinkingModule.swift` /
  `.../android/.../ExpoLinkingModule.kt`) that just returns the launch URL the native side
  already captured at process start. So it is available on the first JS render, in time to
  pick `initialRouteName`. `initialDestination` is frozen with `useMemo(..., [])` on
  purpose — `initialRouteName`/`initialParams` are only ever read by `Stack.Navigator` at
  mount, so reacting to a later URL change here would do nothing but confuse the next
  reader. `Screens.PubInfo` and `Screens.OrderInfoPage` get `initialParams` from
  `initialDestination` when it targets them.
- `src/features/store/linking/LinkingWathcer.jsx` — now calls `parseDeepLink` instead of
  inlining the same parsing. Still uses `Linking.useURL()` (async is fine here: this
  effect's only job is keeping redux in sync for links received *while the app is already
  running* — the warm-start case, handled separately from the cold-start fix above).
- `src/shared/hooks/useLinkedDestination.js` — now calls `resolveDestinationFromFields`
  instead of its own copy of the same three `if`s. Behavior unchanged; this only removes
  the duplication that made the cold-start fix's rules risk drifting from the redux-based
  ones.

## How it works

Two independent paths read the same URL now, for two different situations:

1. **Cold start.** `App.js` reads `Linking.useLinkingURL()` synchronously on the first
   render and, if it resolves to a pub/order/other known screen, mounts
   `Stack.Navigator` with that screen as `initialRouteName` directly.
   `SectionPickerPage` is simply never in the tree for that launch — no flash, nothing to
   redirect away from.
2. **Warm start / link tapped while the app is alive.** `LinkingWathcer` still writes the
   parsed fields into redux on every `url` change (`Linking.useURL()`, unchanged), and
   `SectionPickerPage`'s own `useLinkedDestination` effect still catches it and navigates
   away — this path is unchanged and still matters if the user is sitting on the picker
   when a new link arrives.

`selectSection` in `sectionSlice.js` already falls back to `food` when no section was
ever chosen (comment there: "so that a screen opened by a deep link ... still has a
section to filter with"), so skipping the picker's `dispatch(setSection(...))` on the
cold-start path needed no change — `Home`/`SectionSwitcher` were already written to
tolerate a deep link that never touched the section state.

`PubInfoPage` and `OrderInfoPage` both already read `pubID`/`pubName`/`orderID` off
`route.params` and fetch their own data independently of the `linking` redux slice, so
handing them the same shape of params via `initialParams` instead of `navigate(...,
params)` required no changes on their side.

## Backend gaps

None — this is client-only navigation timing, no new data is needed.

## Known limits / follow-ups

- Verified statically only: every touched file re-parsed with babel, and
  `npx expo export --platform ios` rebuilt the whole bundle clean (`npm run lint` is
  broken repo-wide, see `CLAUDE.md`). Not run on a device — worth a manual pass on both
  platforms: cold-launch the app via a `sepet.md/pub/<id>` link (and via `PubID=`/`PubName=`
  query-param style links, and an order link) and confirm the picker never flashes, plus a
  normal cold start with no link still shows the picker as before.
- `useLinkingURL()`'s synchronous value is the URL the **native side** captured at process
  launch; if a given Android/iOS build ever fails to populate that (e.g. a custom native
  launch path that bypasses `ExpoLinkingRegistry`), the cold-start fast path silently falls
  through to the picker and the existing warm-start redirect in `SectionPickerPage` still
  catches it — degrades to the old (flashing) behavior, doesn't break the link.
- The picker-skip only applies to the very first launch's route. A killed-and-relaunched
  app tapping a *second* link goes through the same synchronous path again (each process
  start re-reads `getLinkingURL()`), so this isn't a one-time-only fix.
