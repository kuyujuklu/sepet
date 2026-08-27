# Remove the section switcher from Home

Date: 2026-08-26

## What & why

Asked to drop the Еда/Цветы/Продукты pill row from the Home header - the client now
chooses the section once on `SectionPickerPage` (the screen before Home), so a second way
to switch it mid-browsing was no longer wanted. The back arrow on Home already leads to
that picker (`fallbackScreen={Screens.SectionPicker}`), so "go back and pick again" is
still one tap away - just not a switcher sitting under the address on every screen.

## Files

### Removed

- `src/widgets/Sections/SectionSwitcher.jsx` — the pill row itself. Confirmed orphaned
  after this change (its only caller was `AppHeader`, see below) rather than left as dead
  code.

### Modified

- `src/widgets/AppHeader/AppHeader.jsx` — dropped `showSections`/`onSectionChange`/`screen`
  props and the `{showSections && <SectionSwitcher .../>}` row, and the now-unused
  `SectionSwitcher` import. `screen` had no other purpose on this component (it only ever
  fed the switcher's analytics `screen` field) - checked every `<AppHeader` call site
  before removing it, only `Home.jsx` ever passed either prop.
- `src/pages/Home/Home.jsx` — `<AppHeader>` no longer passes `showSections`/`screen`/
  `onSectionChange`.

## How it works

Nothing new - this is a deletion. `selectSection` (`sectionSlice.js`) still falls back to
`food` and is still written once by `SectionPickerPage`; Home still reads it via
`selectSection` to filter the feed exactly as before. Only the in-place switching UI is
gone. `events.sectionSelected`/`sectionUnavailable` tracking is unaffected - both already
fire from `SectionPickerPage` itself, which was always the primary place a section gets
chosen.

## Backend gaps

None.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles, so no dangling import from
  the deleted file) and reading the changed files back; not opened on a device.
- If Home's header ever needs bottom breathing room the switcher row used to provide
  incidentally, `AppHeader`'s outer `pb="2"` is unchanged and untouched by this - no layout
  regression expected, but worth a look on a real screen.
