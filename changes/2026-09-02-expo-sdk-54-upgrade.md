# Upgrade Expo SDK 53 → 54 (React Native 0.79 → 0.81)

Date: 2026-09-02
Scope: `app` only.

## What & why

Apple now rejects App Store Connect uploads built with anything older than the iOS 26
SDK / Xcode 26 (error 90725, hit on the first `1.2.50 (9)` upload attempt - see
`changes/2026-08-31-firebase-analytics-sink.md`'s iOS sections for that whole saga).
Expo SDK 53's EAS Build images top out at Xcode 16.2; Expo's own guidance is that
individual SDK 53 apps *can* opt into a newer Xcode image, but compatibility isn't
guaranteed and they recommend upgrading to SDK 54 (which defaults to Xcode 26) instead
of chasing it piecemeal. Also fixes, at the root, the whole reason
`@react-native-firebase` had to be pinned to `25.1.0` yesterday: that pin existed only
because `26.x`'s TurboModule build needs RN 0.81+, which this upgrade now provides -
so firebase is unpinned back to `^26.3.3` here too.

## Files

### Modified

- `package.json` - `expo` `^53.0.20` → `^54.0.0` (installed `54.0.37`), then
  `npx expo install --fix` bumped every SDK-managed native module to its 54-compatible
  version (see `yarn.lock` for the full list; direct-dependency highlights:
  `react-native` → `0.81.5`, `react` → `19.1.0`, `react-native-reanimated` → `~4.1.1`,
  `react-native-screens` → `~4.16.0`, `react-native-safe-area-context` → `~5.6.0`,
  `react-native-gesture-handler` → `~2.28.0`, `react-native-svg` → `15.12.1`,
  `react-native-webview` → `13.15.0`, the `expo-*` family bumped across the board).
  `@react-native-firebase/app`+`analytics` un-pinned from the exact `25.1.0` back to
  `^26.3.3` (latest). Added `react-native-worklets@0.5.1` (new hard dependency of
  Reanimated 4 - the worklets runtime used to ship inside `react-native-reanimated`
  itself, v4 split it out) and `react-native-web@^0.21.0` (was an unmet peer of
  `@gluestack-ui/themed-native-base`, `expo-doctor` flagged it as a real crash risk on
  native, not just a web thing). Added a top-level `resolutions.react-native-gesture-
  handler: "~2.28.0"` - `react-native-animated-numbers` was pulling its own nested
  `gesture-handler@1.10.3`, and `expo-doctor` flags any duplicate native module copy
  as an unpredictable native-build risk under the New Architecture.
- `app.json` - `expo.version` `1.2.50` → `1.2.51` (App Store Connect: "the train
  version 1.2.50 is closed for new build submissions" - `1.2.50 (9)` was already
  uploaded once, even though it errored out on the SDK check, so the version string
  itself can't be reused). The `expo-build-properties` Android
  `compileSdkVersion`/`targetSdkVersion: 36` overrides from yesterday are now the same
  as SDK 54's own default - left in place, redundant but harmless and documents intent.
- `eas.json` - removed `build.production.ios.image` (was pinned to
  `macos-sequoia-15.3-xcode-16.2`). SDK 54 projects default to a Xcode-26 image on EAS
  Build, so the explicit pin was actively wrong now and just deleted rather than
  repointed - lets future SDK bumps keep getting EAS's current default instead of
  going stale again.
- `package-lock.json` - deleted. `expo-doctor` flagged the dual lockfile (npm +
  yarn.lock) as a real CI risk (EAS Build infers package manager from which lockfile
  is present); this file was already noted as "a year-stale leftover, untouched" in
  CLAUDE.md and yarn is the actual package manager here.

## How it works

`npx expo install --fix` is what actually resolves "which native-module version goes
with SDK 54" - it reads Expo's own compatibility table rather than guessing from
semver ranges, which is why the versions above don't all move by the same amount.

Reanimated 4 requires no `babel.config.js` change here specifically because this
project never had an explicit `react-native-reanimated/plugin` entry - it relied on
`babel-preset-expo`'s auto-detection, and `babel-preset-expo@54.0.12` auto-detects
`react-native-worklets/plugin` the same way. Projects that *did* have the old plugin
hardcoded would need to swap it by hand; this one didn't need to.

## Backend gaps

None - client dependency/tooling upgrade only.

## Known limits / follow-ups

- **Verified so far: `expo-doctor` (17/18, the one failure is an unrelated pre-
  existing "unmaintained package" notice for `@react-native-community/geolocation`,
  not something this upgrade touched) and `expo export --platform android/ios`** (both
  needed `NODE_OPTIONS=--max-old-space-size=8192` locally - the default Node heap
  wasn't enough for the bigger SDK 54 module graph and OOM'd mid-bundle; iOS also
  hit one transient `hermesc.exe` crash that didn't reproduce on retry, worth knowing
  about if a build flakes rather than assuming it's a real regression).
- **iOS: confirmed.** `eas build --profile production --platform ios` (id
  `10477b33`, `sdkVersion` 54.0.0, `appBuildVersion` 10) finished clean on the
  Xcode-26 default image - no repeat of the modular-headers issue, no other native
  errors. Downloaded the `.ipa` and re-ran the same verification as before:
  `FIRAnalytics`/`RNFBAnalytics` in the binary, `logEvent`/`logScreenView` in
  `main.jsbundle`. `native-base`/`@gluestack-ui/*` built fine natively too - the
  biggest suspected risk in this upgrade didn't materialize on iOS.
- **Android: in progress** - production build kicked off right after iOS, not
  finished as of writing this line.
- **`native-base`/`@gluestack-ui/*` are the biggest risk in this upgrade and weren't
  specifically vetted beyond "expo-doctor and the JS bundle didn't complain."**
  native-base is community-known as unmaintained in favor of gluestack-ui proper (this
  project runs both, bridged via `@gluestack-ui/themed-native-base`), and its peer-
  dependency warnings (wants React 16/17, project is on React 19) predate this upgrade
  and were already being tolerated. If either native build fails, this pairing is
  where to look first.
- `resolutions.react-native-gesture-handler` silently overrides whatever version
  `react-native-animated-numbers` actually wants (`1.10.3`, i.e. 17+ majors behind).
  It's a small single-purpose component (`src/widgets/Dish/DishCard.jsx` is its only
  call site) - if it breaks under the forced-current gesture-handler, replacing it
  outright is probably less work than debugging the mismatch.
- `@react-native-community/geolocation` still flagged unmaintained by `expo-doctor` -
  pre-existing, not addressed here, low priority since it still works.
- The Android `compileSdkVersion`/`targetSdkVersion: 36` override in
  `expo-build-properties` could now be removed since it matches SDK 54's default, but
  left as explicit documentation instead - no functional difference either way.

## 2026-09-02 (later): added expo-dev-client, first ad-hoc iOS dev build

User wanted real-time on-device testing instead of a full EAS build per change. Ran
`eas build --profile development --platform ios` from their own terminal (not this
session's shell); the CLI itself added `expo-dev-client@~6.0.21` to `package.json`
(pulls in `expo-dev-launcher`, `expo-json-utils`, `expo-updates-interface`) when it
detected the project didn't have it yet, and bumped `expo.ios.buildNumber` 10 → 11 via
the usual `autoIncrement`. No manual code changes - just committing what EAS CLI
already wrote to disk.

This also required registering the user's iPhone for ad-hoc distribution
(`eas device:create --apple-team-id 9V7FZFPUK7` - interactive, needs the device to
open a registration link itself, so it was run in the user's own terminal too, not
from an agent session). Provisioning profile `5GQ53DA4W9` now has that device
(UDID `00008101-001161202221001E`) attached and active until 2027-08-31.

Once installed, this dev-client build lets `npm start` + connecting from the phone
give real JS hot-reload without rebuilding - only native/config changes need a new
dev-client build going forward.
