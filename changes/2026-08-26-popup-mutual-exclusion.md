# Fix: two popups open at once

Date: 2026-08-26

## What & why

Bug report: open one popup, trigger a second one (e.g. viewing a dish in `DishImagePopup`
then tapping "-" down to `RemoveDishPopup`), and both showed up stacked. Every popup in the
app is `Modal` from `BottomSheet` (all 8 of them), each with its own independent redux/local
`isOpened` flag - nothing stopped two of those flags from being `true` at once, and two
simultaneous native `Modal`s is exactly the kind of thing that breaks: dimmed backdrops
stack on top of each other, and on Android the back button/touch targets get confused about
which one is actually on top.

## Files

### Added

- `src/shared/hooks/usePopupExclusive.js` — `usePopupExclusive(id, isOpened, onClose)`. A
  module-level singleton (`activeId` / `requestActiveClose`), not redux: this is pure UI
  coordination ("which native Modal gets to be visible right now"), the 8 popups are opened
  from unrelated redux slices with no shared ancestor to hold this as component state, and
  nothing outside `BottomSheet` needs to observe it. When a popup's `isOpened` turns `true`
  while a *different* id already holds the slot, it calls that other popup's own `onClose`
  before taking the slot itself.

### Modified

- `src/widgets/Common/BottomSheet.jsx` — new required `id` prop, calls
  `usePopupExclusive(id, isOpened, onClose)`. One-line change, every popup goes through this
  file so the fix applies everywhere at once.
- The 8 callers each got a stable `id`: `ClearBasketPopup` (`clearBasket`),
  `RemoveDishPopup` (`removeDish`), `DeleteClientPopup` (`deleteClient`), `DishImagePopup`
  (`dishImage`), `PubNotAvailableForDeliveryPopup` (`pubNotAvailable`), `CategoriesSheet`
  (`categories`), `AddressPickerSheet` (`addressPicker`), `PubInfoPopup` (`pubInfo`).

## How it works

`BottomSheet` doesn't gate its own `Modal`'s `visible` prop on the slot (that would need
plumbing every popup's activeness back into render, which redux-per-popup makes awkward);
instead it makes the *displaced* popup close **itself**, the same way it would if the user
had tapped its own close button - `onClose` is already exactly the callback each caller
wired to flip its own `isOpened` flag off, so this reuses that instead of adding new state.
Concretely: `DishImagePopup` open → `activeId = "dishImage"`. User triggers
`RemoveDishPopup` → its effect sees `activeId ("dishImage") !== "removeDish"`, calls
`dishImage`'s `onClose` (closing it via its own redux action), then claims the slot for
`removeDish`. One popup on screen, always.

`onClose` is read through a ref inside the hook so the effect's dependency array only needs
`[id, isOpened]` - callers pass a fresh arrow function every render (`() =>
dispatch(closeX())`), and depending on that directly would re-run the effect (and
misfire the close-the-previous-popup logic) on every unrelated re-render of the popup that
is currently open.

## Backend gaps

None - purely a client-side UI coordination bug.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and reading every touched
  file back; not exercised on a device. Worth manually reproducing the original repro
  (dish popup → decrease to 0 → remove-dish popup) to confirm only one dialog shows and the
  displaced one's own state (e.g. `dishImagePopup.isOpened` in redux) actually goes back to
  `false` rather than staying stuck `true` while invisible.
- Any *new* popup must go through `BottomSheet` with its own unique `id`, or it silently
  sits outside this protection. There is no runtime check that ids are actually unique
  across the 8 (a typo'd duplicate would make two different popups fight over one slot) -
  acceptable today at 8 known call sites, worth a dev-only warning if more get added later.
