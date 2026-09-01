# Wire the analytics event catalogue to Firebase Analytics

Date: 2026-08-31

## What & why

The event catalogue (`events.js`) and middleware were already correct and complete
(see `2026-08-27-analytics-cleanup.md`), but `setAnalyticsSink()` was never called
anywhere - every `track()`/`trackScreen()` call had been going to `consoleSink` in
dev and `noopSink` in production since the seam was built. Nothing reached any
vendor. This wires the first real one: Firebase Analytics, chosen because the
project already has both `google-services.json` and `GoogleService-Info.plist`
checked in (currently only used for push, per app.json's `googleServicesFile`
fields) - no new Firebase project needed, and it's free.

## Files

### Added

- `src/shared/analytics/firebaseAnalyticsSink.js` - `initFirebaseAnalyticsSink()`
  builds one `Analytics` instance via the modular API (`getAnalytics(getApp())` -
  this SDK version, 26.3.2, only ships the modular API, the old namespaced
  `analytics()` singleton is gone) and registers a sink that routes
  `events.screenView` through `logScreenView` specifically (populates Firebase's
  reserved `firebase_screen`/`firebase_screen_class` params) and everything else
  through a plain `logEvent(analytics, event, props)`.

### Modified

- `App.js` - imports the new file and calls `initFirebaseAnalyticsSink()` once at
  module scope, next to the existing `if (!__DEV__) { console.log = ... }` block -
  not inside a component/effect, since it has no render dependency and the sink
  comment already says "once on startup".
- `app.json` - added two Expo config plugin entries, both required for a working
  native build, not optional extras:
  - `@react-native-firebase/app` with `ios.disableSPM: true`. RN 0.75+ defaults to
    Swift Package Manager for the Firebase iOS SDKs, which needs
    `use_frameworks! :linkage => :dynamic`; this app has no frameworks-linkage
    config anywhere, so SPM's default would very likely not build. Falling back
    to CocoaPods (the long-established, better-tested path) avoids introducing
    that unknown into the first Firebase integration this app has had.
  - `@react-native-firebase/analytics` with `ios.withoutAdIdSupport: true`. Without
    this, the iOS pod pulls in `FirebaseAnalytics/IdentitySupport` (IDFA
    collection), which requires an App Tracking Transparency prompt - out of
    scope for "get basic event analytics working," and this app has no
    `expo-tracking-transparency` or `NSUserTrackingUsageDescription` set up at
    all. Firebase Analytics works fully for standard/custom events without IDFA;
    this only reduces IDFA-linked ad-attribution features, which aren't in use.

### Installed (package.json / yarn.lock only - see Known limits)

- `@react-native-firebase/app@26.3.2`, `@react-native-firebase/analytics@26.3.2`,
  via `npx expo install` (yarn is the repo's real package manager -
  `package-lock.json` is a year-stale leftover, untouched).

## How it works

`track(event, props)` in `analytics.js` already wraps every sink call in
try/catch (analytics must never crash the app) - `firebaseAnalyticsSink.js` relies
on that instead of adding its own error handling. No change to the event catalogue
or middleware; this only fills in the one function call the whole system was
built to need.

## Backend gaps

None - this is entirely a client-side vendor connection, no backend involved.

## Known limits / follow-ups

- **Not build-verified.** Everything here is checked as far as this repo's tooling
  goes without a native build: `npx expo export --platform ios` succeeded (the
  whole module graph resolves, app.json's plugin config is well-formed enough for
  Expo to accept it), which is the strongest check available since `npm run lint`
  is broken (see CLAUDE.md). It does **not** exercise CocoaPods/Gradle, so
  `disableSPM`/`withoutAdIdSupport` actually producing a working iOS build is
  unverified until a real `eas build` runs prebuild. If iOS fails, the SPM
  guide referenced from `node_modules/@react-native-firebase/app/README.md`
  ("iOS SPM guide" link) is the next thing to read - I could not fetch it live.
- No consent gate and no stable client id, same as the original audit flagged on
  2026-08-27 - still open, still a product decision, not touched here.
- To confirm events are actually landing: Firebase Console → Analytics →
  DebugView shows near-real-time events from a device with
  `adb shell setprop debug.firebase.analytics.app com.camelapp.app` set (Android)
  or the `-FIRDebugEnabled` launch argument (iOS); the regular Analytics dashboard
  has a real reporting delay (up to 24h) so DebugView is the right tool for a
  first check, not the dashboard.
- `logEvent`'s custom-event/param names in this catalogue (`events.js`) are all
  lowercase snake_case, well inside Firebase's naming limits (40 chars,
  alphanumeric+underscore) - not re-validated per-event here, no changes needed.

## 2026-09-01: Android build was failing - downgraded to 25.1.0

### What & why

The "not build-verified" flag above was hiding a real break: any Android build with
`@react-native-firebase/app`/`analytics@26.3.2` fails during the native step, so
yesterday's wiring could never have shipped on Android as committed. Root-caused with
a real EAS build (`eas build --profile preview --platform android`, build id
`30ee25f2-0acb-48cb-8320-5a53ba10bbfc`) and fixed by pinning both packages back to
`25.1.0`.

The actual error, from the Gradle log (`:app:configureCMakeRelWithDebInfo[arm64-v8a]`):

```
CMake Error at node_modules/@react-native-firebase/analytics/android/src/reactnative/java/io/invertase/firebase/analytics/generated/jni/CMakeLists.txt:28 (target_compile_reactnative_options):
  Unknown CMake command "target_compile_reactnative_options".
```

Confirmed locally: `target_compile_reactnative_options` does not exist anywhere under
this project's `node_modules/react-native/ReactAndroid` (RN **0.79.5**) - it's a
function React Native's own cmake-utils only gained in **0.81+**. react-native-firebase's
CHANGELOG shows `26.0.0` ("**analytics:** migrate analytics to TurboModules", 2026-07-29)
as the breaking change that starts shipping a pre-generated
`android/.../generated/jni/CMakeLists.txt` *inside the npm package itself* referencing
that function - confirmed by downloading and diffing the actual `25.1.0` vs `26.0.0`
tarballs from the npm registry: `25.1.0`'s `ReactNativeFirebaseAnalyticsPackage.java`
still `implements ReactPackage` (old bridge, no `generated/` dir at all, no
`codegenConfig` in `package.json`); `26.0.0`'s is otherwise-identical Java but the
package now ships the whole `generated/jni` + `generated/java/.../specs` TurboModule
tree and a `codegenConfig` block. So this is a hard floor, not a config knob: any
`26.x` (`26.0.0` through at least the current `26.3.3`) will hit this on RN < 0.81.

`25.1.0` was chosen as the target because it's the last release before that migration
(one version back from `26.0.0`, released 2026-06-25) and still ships the modular API
(`getApp`, `getAnalytics`, `logEvent`, `logScreenView`) that `firebaseAnalyticsSink.js`
already uses - verified present in `25.1.0`'s compiled `dist/module/modular.js` for
both packages before switching, so no code changes were needed, only the dependency
pin.

### Files

#### Modified

- `package.json` / `yarn.lock` - `@react-native-firebase/app` and `.../analytics`
  pinned to exact `25.1.0` (`yarn add --exact`, not `^25.1.0`) so a routine
  `yarn install`/upgrade can't silently float back into the `26.x` line and
  reintroduce this. Revisit the pin once the project moves to RN 0.81+.
- `app.json` - unrelated side-fix found while retrying the build: the first (failed)
  local `eas build --profile preview` run's `autoIncrement` had already bumped
  `expo.android.versionCode` from 64 to 65 before the Gradle step failed, but Play
  already has build `67` (production, submitted 2026-08-31). Set to `68` so the next
  build doesn't get rejected as a lower versionCode than what's already live - see
  CLAUDE.md's note on `appVersionSource: "local"` for why this matters.

### How it works

No change to `analytics.js`, `events.js`, or `firebaseAnalyticsSink.js` - the modular
Firebase JS API this app calls is present unchanged in `25.1.0`. The only difference is
which native module registration path gets compiled: `25.1.0` uses the old
`ReactPackage` bridge (works fine under `newArchEnabled: true` via RN's interop layer,
same as most of this app's other native deps), `26.x` forces a TurboModule/Fabric JNI
build that this RN version's cmake-utils can't satisfy.

### Backend gaps

None - still client-side only.

### Known limits / follow-ups

- Still needs a real successful Android build to confirm this actually fixes it (the
  investigation above is strong - direct log error, confirmed-missing CMake symbol,
  confirmed-added-in-26.0.0 via changelog + tarball diff - but nothing here has
  compiled successfully on Android yet as of writing this).
- When this project eventually upgrades to RN 0.81+, the exact pin on
  `@react-native-firebase/app`/`analytics` should be revisited - `26.x`'s TurboModule
  build would then work, and staying on `25.1.0` indefinitely means missing whatever
  `26.x` added beyond the architecture migration.
- iOS was not touched or re-checked here; the CMake failure is Android-only
  (`generated/jni` is the Android native build path). If iOS ever gets a real build
  attempt, re-verify against `25.1.0` too since the original sink note already flagged
  iOS as unverified.

## 2026-09-01 (later): iOS build - CocoaPods modular headers

First real iOS build attempt (`eas build --platform ios --profile production`, id
`d08cf924`) failed at `INSTALL_PODS`:

```
[!] The following Swift pods cannot yet be integrated as static libraries:

The Swift pod `FirebaseCoreInternal` depends upon `GoogleUtilities`, which does not
define modules. To opt into those targets generating module maps ... you may set
`use_modular_headers!` globally in your Podfile, or specify `:modular_headers => true`
for particular dependencies.
```

This project builds Firebase's Swift pods (`FirebaseCoreInternal`) without
`use_frameworks!` (plain static libraries, CocoaPods' default here), and
`GoogleUtilities` doesn't ship a module map, so Swift can't import it. This is a
well-known Firebase+CocoaPods+static-libs issue, not specific to
`react-native-firebase` or the `25.1.0` pin.

`expo-build-properties` has no blanket `use_modular_headers!` switch, only per-pod
`ios.extraPods[].modular_headers`. Added entries for the pods actually in this
project's resolved pod list that are implicated by the error chain: `GoogleUtilities`,
`Firebase`, `FirebaseCore`, `FirebaseCoreInternal` - not the longer lists some
Firebase-Storage/Auth/Messaging guides use, since this app only pulls in Core +
Analytics natively.

**Known limits / follow-ups (this section):**
- **Confirmed sufficient** - the four-pod list was enough, no further un-modular pods
  surfaced. `eas build --profile production --platform ios` (id `ae9cf8ea`,
  `appBuildVersion` 9) finished clean. Downloaded the resulting `.ipa` and verified
  directly: the main binary has `FIRAnalytics`/`RNFBAnalytics` symbols, and
  `main.jsbundle` has `logEvent`/`logScreenView` - same verification approach as the
  Android checks above, not just trusting build status.
- Switching to `ios.useFrameworks: 'static'` (static *frameworks*, not static
  libraries) was considered instead - it's the more commonly recommended fix for new
  Firebase integrations - but per current research this doesn't reliably avoid the
  same "does not define modules" class of error either (GoogleUtilities still lacks a
  module map regardless of libs-vs-frameworks), and it's a much bigger blast-radius
  change (affects every pod's link mode, not just Firebase's), so the targeted
  `modular_headers` list was tried first.
