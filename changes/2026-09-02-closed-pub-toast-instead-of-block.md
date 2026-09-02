# Closed pub no longer blocks adding to basket - toast instead

Date: 2026-09-02
Scope: `app` only.

## What & why

Previously, tapping "+" on a dish from a closed pub opened
`PubNotAvailableForDeliveryPopup` and refused to add it - the same popup fired for
"pub is closed" and "you're outside this pub's delivery zone", both treated as hard
blocks. User asked to split these: being outside the delivery zone is still a real
block (changing the hours won't fix that), but "just closed right now" should let the
client keep building their basket, with a toast instead of a bottom-sheet interrupting
them - so they can prepare an order for whenever the pub reopens instead of being
turned away entirely.

## Files

### Modified

- `src/widgets/Dish/DishCard.jsx`, `src/widgets/Dish/DishRow.jsx`,
  `src/widgets/Dish/DishImagePopup.jsx` - each had the same shape: `isPubOpen` and
  `isAvailableForDelivery` were OR'd together into one block. Split apart: only
  `isAvailableForDelivery === false` still dispatches
  `openPubNotAvailableForDeliveryPopup()` and returns early; `isPubOpen === false` now
  dispatches `pushAlert(...)` (see "2026-09-02 (later)" below for why this isn't
  native-base's `useToast`) and falls through to `dispatch(increaseDish(...))` same as
  the open-pub path. Each file's `canOrder` (feeds `QuantityStepper`'s visual
  enabled/disabled color - it doesn't actually gate `onPress`, see that component's
  source) dropped the `isPubOpen` check too, so the button no longer looks disabled for
  a state that no longer blocks it.
- `src/widgets/TopDishes/TopDishCard.jsx` - same idea, but this card's feed is
  pre-filtered to deliverable pubs (`isAvailableForDelivery: true` is hardcoded when it
  opens the dish popup), so there was never a delivery-zone branch here - just replaced
  the popup dispatch with the same alert, removed the now-unused
  `openPubNotAvailableForDeliveryPopup` import, and `canOrder` is just `isAvailable`
  now.
- `assets/locales/ru.js` / `ro.js` / `gz.js` (`pub_not_available_for_delivery` key):
  - Added `closed_toast` - "Заведение сейчас закрыто, но вы можете собрать корзину
    или оформить предзаказ в рабочее время" (ro/gz are my approximate translations,
    same caveat as every other multi-locale note in this repo - flag for a native
    speaker to check).
  - Reworded `pub_is_not_open` to drop the "or is closed" half - since the popup this
    string belongs to (`PubNotAvailableForDeliveryPopup`) now only ever fires for the
    delivery-zone case, the old wording ("this pub is closed or you're outside its
    delivery zone") would have been actively misleading about why the order can't go
    through.

## How it works

No new component, no new redux state - `pushAlert()` is this app's existing toast/alert
system (`alertSlice` + `<AlertWrapper />`, mounted once in `App.js`, already used by
e.g. `useRepeatOrder.js`). Each of the four call sites already received
`isPubOpen`/`isAvailableForDelivery` as props from whichever screen renders it - no
change to how that data flows in, only to what happens once a dish card interprets it
as "closed" specifically.

## Backend gaps

None - this is a client-side gating change against fields (`pub.isOpen`, delivery
availability) that were already being passed in.

## Known limits / follow-ups

- **"Собрать корзину или оформить предзаказ" is copy, not a feature.** There is no
  scheduled/pre-order concept anywhere in this codebase (checked - nothing named
  preorder/предзаказ exists). The toast just describes using the app now to prepare a
  basket and completing the order later during working hours - checkout itself is
  untouched, so if checkout has its own independent closed-pub gate somewhere it was
  not touched or audited here (not found in a search, but worth a real end-to-end
  check: add a dish from a closed pub, then walk all the way to checkout, on a device).
- ro/gz `closed_toast` translations are unreviewed machine-quality approximations,
  same standing caveat as the rest of this repo's non-Russian copy.

## 2026-09-02 (later): native-base's useToast crashes on RN 0.81 - switched to pushAlert

First on-device test (the user's new iOS dev-client, see
`2026-09-02-expo-sdk-54-upgrade.md`) caught exactly the kind of thing static checks
can't: tapping "+" on a closed pub's dish crashed with a white screen. The red-box
error:

```
Render Error
_reactNative.BackHandler.removeEventListener is not a function (it is undefined)
  at useEffect$argument_0 (native-base/.../useKeyboardDismissable.ts)
```

React Native removed `BackHandler.removeEventListener` (the old non-subscription API)
somewhere around the RN 0.81 line; native-base@3.4.28 (already flagged as this repo's
biggest upgrade risk - see the SDK 54 note) still calls it inside
`hooks/useKeyboardDismissable.ts`, which backs native-base's `Overlay` primitive -
and `Toast`'s `CustomToast` wraps every toast in an `<Overlay>`. So `useToast()` was
never going to work post-upgrade; this had nothing to do with the closed-pub logic
itself, only with which UI primitive rendered the message.

Checked how far this reaches: `useKeyboardDismissable` is only pulled in by
native-base's `Overlay`, `Popover`, and `Tooltip` (`grep` inside
`node_modules/native-base/src`). This app doesn't import `Popover` or `Tooltip`
anywhere (checked every `from "native-base"` import in `src/`) and, after this change,
no longer imports `useToast`/`Overlay` either - so this specific breakage has no other
live call sites left. If native-base is ever reached for again, this is the landmine to
remember: anything built on its `Overlay` primitive is broken until either native-base
is patched or RN's old `BackHandler` API comes back (it won't).

**Fix:** swapped every `toast.show({...})` for `dispatch(pushAlert({ status:
alertStatuses.info, delay: 4000, title: t(...) }))` - this app's own pre-existing
alert system (`MyAlert.jsx` uses native-base's `Alert`/`HStack`/`IconButton`, not
`Overlay`, so it doesn't touch the broken hook). Removed the now-unused `useToast`
imports from all four files. Re-ran `expo export --platform android` clean; the
crash itself was only catchable on a real device, so trust the user's next on-device
retest over this note for whether it's actually fixed.
