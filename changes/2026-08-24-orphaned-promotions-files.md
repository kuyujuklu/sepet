# Orphaned promotions files (context, not a change)

Date: 2026-08-24

Not a feature I built — a trap left in the working tree that a future session will hit.

At the start of this session the user asked to reset all git changes to the latest commit
(`c7124c4`). `git reset --hard HEAD` reverted the 9 tracked modified files; untracked
files were intentionally left alone. Among those untracked leftovers is an unfinished
**promotions** feature:

- `src/shared/api/promotions/promotionsApi.js` — RTK Query api for
  `/api/client/get-available-promotions` and `/api/client/pub/id/{id}/promotions`.
- `src/shared/utils/promotions.js` — badge/title/subtitle builders for a promotion.
- `src/widgets/Promotions/{PromotionCard,PubPromotions}.jsx`.

**These files do not currently work.** Their supporting edits were in the files that got
reset:

- `src/shared/utils/promotions.js` imports `promotionTypes` from
  `src/app/static-data/data.js` — that export no longer exists.
- `promotionsApi` is not registered in `src/features/store/configureStore.js`
  (no reducer, no middleware), so its hooks would throw if used.
- The `promotions.*` translation keys are gone from `assets/locales/*`.

Nothing imports them, so the app builds fine. If the promotions feature is picked up
again, those three things have to be restored first. If it is not, the files should be
deleted rather than left to rot.

Whether the backend endpoints they call actually exist was never verified from the client
side.
