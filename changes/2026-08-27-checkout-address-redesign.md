# Checkout address: drop the duplicate inputs, add a save-for-later choice

Date: 2026-08-27

## What & why

Screenshot-driven: the address card at checkout showed the same address three times -
a "Заказ доставим сюда" display card, a "Изменить адрес" button, and then, right under
both, plain editable "Город"/"Полный адрес" text inputs pre-filled with the same value.
Nothing indicated which of the three actually won if they ever disagreed.

Asked to drop the raw inputs and keep the display+button version - but also to make sure
the screen still clearly says *which* address the order is going to, still offers picking
from saved addresses, adding a new one, and now also a way to use an address just for this
one order without permanently bookmarking it.

## Files

### Modified

- `src/widgets/Orders/CreateOrder/CreateOrder.jsx` — the `address` section's
  `<CreateOrderInputs>` call (town/full-address text fields) is gone. New: a
  save-for-later checkbox row, shown only when the current address is not already in
  `selectSavedAddresses` (picking one from the list, or re-confirming an address you have
  ordered to before, needs no such choice - it is already saved). Defaults checked (the
  old, only behavior: every checkout address used to get saved automatically). The
  order-success effect now only calls `appendSavedAddress` when the checkbox is on *and*
  the address is not already saved; `setGeolocation` (the app's current-location context -
  what the top bar and next screen's "nearby" queries read) still updates unconditionally,
  because that is a different thing from the bookmarked list.
- `src/widgets/Orders/CreateOrder/CreateOrderInputs/CreateOrderInputs.jsx` — the `address`
  branch (and its now-unused `town`/`setTown`/`fullAddress`/`setFullAddress` props and
  `validateTown`/`validateFullAddress` imports) removed - confirmed via a repo-wide grep
  that `CreateOrder.jsx` was the only caller of this branch before deleting it. The
  `phones`/`comments` branches are untouched.
- `assets/locales/{ru,ro,gz}.js` — `create_order_page.address.save_toggle`. ro/gz are my
  own translations, not native-checked, same caveat as every other ro/gz addition here.

## How it works

Three things the address card now does, none of them new machinery - `AddressPickerSheet`
(saved-addresses list + "Добавить новый адрес" → the real map/form flow,
`SelectGeolocationPage`) already existed and needed no changes:

1. **"Where is this going"** - the existing `styles.current` block: icon, "Заказ доставим
   сюда", the resolved address label, an approximate-location warning when relevant. This
   was already the clearest of the three duplicates, so it is the one kept.
2. **Pick saved / add new** - the existing "Изменить адрес" button opening
   `AddressPickerSheet`, unchanged.
3. **Save this one or not** - new. `isCurrentAddressSaved` compares `{town, fullAddress}`
   against `selectSavedAddresses`; when it is *not* a match, a checkbox offers "Сохранить
   адрес для будущих заказов", defaulted on. Unchecking it means the order still ships to
   that address (nothing about delivery changes), but nothing gets written to the saved
   list afterward - "только для текущей доставки" without adding a second, parallel
   address-entry mechanism.

## Backend gaps

None - purely client-side state and a UI simplification.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and reading every changed
  file back; not opened on a device. Worth a manual pass: pick a saved address (checkbox
  should not appear), add a brand-new one via the map (checkbox should appear, checked),
  uncheck it and complete an order (address should NOT show up in
  `AddressPickerSheet`/Profile afterward), leave it checked and complete one (it should).
- With the inputs gone, an invalid/missing address at submit only surfaces as the existing
  generic "Заполните обязательные поля" alert - there is no more inline red-bordered field
  pointing at the address specifically (phone fields still have that, via `CreateOrderInputs`'s
  `phones` section). Worth revisiting if that generic alert turns out to be confusing in
  practice - e.g. a highlighted state on the address card itself when `triedToSubmit` and
  the address is still empty.
