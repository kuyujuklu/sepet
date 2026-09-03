# Add expo-updates (EAS Update / OTA)

Date: 2026-09-03
Scope: `app` (this note) + `courier-app` (sibling repo, no `changes/` convention of its
own — documented here since it was done as one instruction, "add expo-updates to both
apps").

## What & why

User asked whether future JS-only changes could ship without a full store rebuild.
Wired up EAS Update (OTA) capability in both client apps so a future `eas update` can
push JS/asset changes to installs already on that runtime version, without an App
Store/Play review cycle. This commit only wires the *capability* — no update has been
published and no native build has been triggered (see "Known limits" — this matters a
lot here).

## Files

### `app/`

- `package.json`, `yarn.lock` — `npx expo install expo-updates` added
  `expo-updates@29.0.20` + its deps (`expo-eas-client@1.0.8`, `expo-structured-headers@5.0.0`).
- `app.json` — `npx eas update:configure --non-interactive` added:
  ```json
  "runtimeVersion": { "policy": "appVersion" },
  "updates": { "url": "https://u.expo.dev/e149f77b-df25-4a08-a7e7-d885dc5397ab" }
  ```
- `eas.json` — same command added `"channel"` to each build profile
  (`development`, `preview`, `production`), matching the profile name. A build's
  channel is what an `eas update --channel X` publish actually reaches.

### `courier-app/`

Identical treatment: `expo-updates` installed, `app.json` got the same
`runtimeVersion`/`updates` pair (pointed at its own project id
`4157c782-3e7e-415c-8e42-da015bba9d15`), `eas.json` got `"channel": "internal"` /
`"channel": "production"` on its two profiles. No `changes/` note lives in this repo —
recorded here only.

## How it works

`runtimeVersion: {policy: "appVersion"}` ties compatibility to `expo.version` in
`app.json` — an update published while `version` is `"1.2.51"` only reaches installs
built from that same version string. Bumping `version` (already required for every
store release, per this repo's own versioning rule) implicitly starts a new runtime
lineage; old installs stop matching until they get the next native build. This is the
standard/safe policy — no manual runtime-version bookkeeping — but it does mean an OTA
update is only useful *between* store releases of the same version, not as a
substitute for them.

`eas update:configure` also silently rewrote three unrelated arrays in `app/app.json`
(`associatedDomains`, Android `permissions`, `intentFilters` — each entry duplicated)
and added `enableMinifyInReleaseBuilds: true` under the `expo-build-properties` android
block. None of that has anything to do with OTA — best guess is the command round-trips
the whole config through the config-plugins mod pipeline (`expo-location`'s
permission-adding mod, the custom Android blocks) and something in that path
re-applies already-satisfied mods instead of detecting they're already there.
`courier-app/app.json` — which has no location/build-properties/custom-intent-filter
plugins to trigger the same path — came back with a perfectly clean diff, which is what
pins the cause on `app/`'s specific plugin set rather than the command generally.
Reverted all four unrelated changes by hand; `git diff app.json` now shows only the
two intended keys. **Worth knowing for next time**: any future
`eas update:configure` / `eas build:configure` run against `app/` should have its
`app.json` diff checked line-by-line before trusting it, not just skimmed for the
expected keys.

## Backend gaps

None — this is a pure client/EAS-project config change, no backend involvement.

## Known limits / follow-ups

- **The currently-shipped builds (iOS TestFlight #12, Android #73 — see
  `project_app_release_status` memory) do not have the `expo-updates` native module
  compiled in.** This config only takes effect starting with the *next* native build of
  each app (`eas build`) — nothing is OTA-updatable yet, and nothing will be until a new
  build is made and installed. No build was triggered here, per the standing "don't
  build bundles until I say so" instruction.
- **No `eas update` has been run.** The `production`/`preview`/etc. channels exist in
  config now but have no published update and therefore no linked branch yet — the
  first `eas update --channel <name>` call creates that automatically. Not attempted
  here; publishing anything is a separate, explicit decision from wiring up the
  capability.
- **Not verified end-to-end** (can't be, without a real device on a real build) — only
  verified that both apps still resolve/compile via `npx expo export --platform ios`
  after every edit, same standard as every other unbuilt change in this repo.
- Native-code changes (new permissions, new native deps, SDK bumps) are never covered
  by OTA regardless of this setup — those always need a real `eas build`. Worth a short
  reminder to whoever eventually publishes updates so they don't reach for `eas update`
  when a change actually needs a rebuild.
