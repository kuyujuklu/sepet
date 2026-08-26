# CLAUDE.md

Sepet client app — Expo / React Native (RN 0.79, Expo 53), Redux Toolkit + RTK Query,
native-base for UI, i18next for texts. Feature-sliced-ish layout under `src/`:
`pages/` (screens) → `widgets/` (composed UI) → `shared/` (api, utils) → `features/store/` (redux).

## Rule: document every change in `changes/`

Whenever I change or add anything in this repo, I must also write a Markdown note in
`changes/` describing it. This is not optional and the user should not have to ask.

- One file per task/feature: `changes/YYYY-MM-DD-short-slug.md`.
- Add a one-line entry for it in `changes/README.md` (the index).
- If a later task extends an existing feature, update that feature's file instead of
  creating a near-duplicate one, and add a dated section inside it.

These notes are written **for me, not for the user** — the user does not read them.
So: no marketing tone, no "great news", no re-explaining React. Write what a future
session needs in order to pick the work up cold.

Every note must contain:

1. **What & why** — one short paragraph.
2. **Files** — added / modified / removed, one line each saying what the file does.
3. **How it works** — the data flow, the non-obvious decisions, the heuristics and why
   they exist.
4. **Backend gaps** — REQUIRED section. What data the backend does not provide today
   and what I had to work around or fake because of it, plus the concrete endpoint /
   field changes the backend should make. Mark each item as `missing data` or
   `API change needed`, and say what the client can drop once it lands.
5. **Known limits / follow-ups** — what is unfinished, risky, or worth revisiting.

## Repo notes

- `npm run lint` is broken (`.eslintrc.js` has an invalid `overrides[0].no-trailing-spaces`
  key). Don't trust it to validate work. What to do instead, in order of strength:
  1. `npx expo export --platform ios --output-dir .expo-export-check` (then delete the
     dir) — builds the real production bundle, so the whole module graph has to resolve
     and compile.
  2. An undefined-reference sweep with `@babel/traverse`: walk every `ReferencedIdentifier`
     and flag the ones with no binding in scope and not a known global. This is the check
     that catches `memo(...)` used without `import { memo } from "react"` — a crash on
     first render that a bundle build happily produces.
  3. `babel.parseSync` per file for syntax, plus resolving every relative import path.
- **Release versions live in `app.json` and must be committed.** `eas.json` sets
  `appVersionSource: "local"` with `autoIncrement: true`, so every EAS build rewrites
  `expo.android.versionCode` / `expo.ios.buildNumber` in the working tree. If those bumps
  are not committed, the next checkout builds from a stale number and Google Play rejects
  the bundle with "не позволяет существующим пользователям обновить наборы App Bundle"
  (the new versionCode is lower than what users already have). Check reality with
  `npx eas build:list --platform android --limit 20 --non-interactive --json` before a
  release; the highest `appBuildVersion` there is the number to beat.
- Route names live in `src/app/navigation/screens.js`, **not** in `App.js`. Importing
  `Screens` from `App.js` puts the importer in a require cycle
  (App → screen → widget → App); Metro allows it but resolves it with whatever was
  initialised first. `App.js` re-exports `Screens` only for compatibility.
- There are three locales and all of them must be updated together:
  `assets/locales/ru.js`, `ro.js`, `gz.js` (gz = Gagauz). `ru` is the fallback language.
  ro/gz translations I write are approximate and should be flagged for a native check.
- Prices: the basket stores prices **without** the delivery-service commission; the
  commission is added at display time (`src/shared/utils/dish.js`).
- Global popups (`DishImagePopup`, `PubNotAvailableForDeliveryPopup`, `ClearBasketPopup`)
  are mounted once in `App.js` and opened via redux, so any screen can trigger them.
