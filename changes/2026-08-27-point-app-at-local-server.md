# Pointing the app at the local backend (:9999)

Date: 2026-08-27
Scope: `app` only.

## What & why

The dev/prod switch already existed (`src/constants/env/env.js` picks `dev.js` or
`prod.js` off `EXPO_PUBLIC_IS_DEV`), but it was off and `dev.js` had a hardcoded LAN
address that had gone stale — it said `192.168.100.52`, this machine is `192.168.100.89`.
So "switch to dev" would have produced an app talking to nothing. Turned the switch on
and made the host derive itself instead of being typed in.

## Files

- `.env` — `EXPO_PUBLIC_IS_DEV=1` (was `""`). Commented, with the Android-emulator
  override spelled out.
- `src/constants/env/dev.js` — host is now derived, port/static path unchanged
  (`9999`, `/static`).

## How it works

`dev.js` reads `Constants.expoConfig.hostUri` (falling back to
`Constants.expoGoConfig.debuggerHost`) — the host Metro is already being served from —
and takes the hostname off it, then appends `:9999`. On a physical device that host *is*
this machine's LAN address, which is exactly what the phone needs to reach the backend,
and it follows the machine around instead of going stale on the next DHCP lease. With no
hostUri (production build, some web contexts) it falls back to `localhost`, which is
right for the iOS simulator and the web build.

`EXPO_PUBLIC_API_HOST` overrides it outright. That is there for the Android emulator,
which cannot use the LAN address and reaches the host through `10.0.2.2`, and for a
tunnel.

Verified by transpiling `dev.js` with `babel-preset-expo` and evaluating it against a
stubbed `expo-constants`:

| hostUri | `EXPO_PUBLIC_API_HOST` | result |
| --- | --- | --- |
| `192.168.100.89:8081` | — | `http://192.168.100.89:9999` |
| (none) | — | `http://localhost:9999` |
| `192.168.100.89:8081` | `10.0.2.2` | `http://10.0.2.2:9999` |

Also confirmed `env.js` inlines to `"1" ? dev : prod` after Babel, i.e. the switch really
is on and `prod.js` is dead code in this build.

All four fields the app reads (`API_HTTP_URL`, `API_SERV`, `WS_SCHEME`,
`API_STATIC_PATH`) come from the same object, so the orders websocket
(`ws://<host>:9999/ws/orders/client`) and the dish/pub images follow along with no
further changes. Note the static path differs between the two environments — `/static`
locally (`main.go`: `app.Static("/static", "clientfiles")`) vs `/api-static` in
production — which is why it lives in the env file rather than at the call sites.

## Backend gaps

None — this change is entirely client-side configuration. `backend/.env` already sets
`PORT=9999` and mounts `/static`; nothing on the server had to move.

## Known limits / follow-ups

- **`.env` is not gitignored** (`.gitignore` only covers `.env*.local`), so this commits
  a dev-pointing app. It has to be blanked back to `EXPO_PUBLIC_IS_DEV=` before a release
  build, or a store build will ship pointing at a LAN address. Worth considering moving
  the flag to `.env.local` and gitignoring it.
- **Cleartext HTTP on Android.** `app.json` sets no `usesCleartextTraffic`, so this
  relies on debug builds allowing cleartext by default. A *release*-configuration build
  pointed at `http://` would have its requests blocked silently.
- The backend was not running on :9999 while this was set up, so the app has not actually
  been seen talking to it — only the resolved URLs were verified.
