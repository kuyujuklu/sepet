# Checkout "Изменить адрес" opens the real address screen, not a duplicate popup; auto-detected town/street

Date: 2026-08-27

## What & why

Two related changes:

1. "Изменить адрес" at checkout opened `AddressPickerSheet`, a popup that duplicated
   `SelectGeolocationPage` (the same saved-addresses list + "add new" flow every other
   address entry point in the app already uses). Asked to delete the popup and go straight
   to that screen instead.
2. That screen's "add a new address" flow ends on `SelectGeolocationInputs` - a pin on the
   map, then blank "Город"/"Полный адрес" fields the client had to type from scratch.
   Asked to detect town/street there instead.

## Files

### Removed

- `src/widgets/Orders/CreateOrder/AddressPickerSheet.jsx` — confirmed (grep) its only
  caller was `CreateOrder.jsx`.

### Modified

- `src/widgets/Orders/CreateOrder/CreateOrder.jsx` — "Изменить адрес" now
  `navigator.navigate("SelectGeolocationPage")`; the sheet, its `isOpened` state and the
  now-unused import are gone.
- `src/shared/hooks/useLinkedDestination.js` — `goToLinkedDestination()`, called by every
  address-selection action on `SelectGeolocationPage` (pick current, pick saved, save a
  new one), now prefers `navigator.goBack()` over "always go to Home" when there is no
  pending deep link. This is what makes leaving checkout for the address screen and coming
  back actually **return to checkout** - without it, picking an address from anywhere
  would always bounce to Home regardless of where you started (checkout, the top bar on
  any screen, ...). Home stays the fallback for the one case with nothing to go back to: a
  cold start whose deep link target *is* this flow.
- `src/shared/utils/geolocation.js` — new `describeCoords(coords)`, moved here from
  `GeolocationFinder.jsx` (see below) so more than one screen can reverse-geocode a point
  without copy-pasting the fallback-to-nearest-city logic.
- `src/widgets/Geolocation/GeolocationFinder.jsx` — imports `describeCoords` from the
  shared util instead of defining its own copy. No behavior change.
- `src/widgets/Geolocation/SelectGeolocationInputs.jsx` — as soon as `geolocation`
  (the pinned point) is available, calls `describeCoords` and pre-fills `town`/
  `fullAddress` with whatever it finds, with a small "Определяем адрес…" spinner while it
  resolves. A `editedRef` guard means a reply that lands after the client already started
  typing is dropped instead of overwriting what they wrote.
- `assets/locales/{ru,ro,gz}.js` — `select_geolocation.detecting_address`. ro/gz are my own
  translations, not native-checked, same caveat as every other ro/gz addition here.

## How it works

**Popup → real screen.** No new navigation machinery - `SelectGeolocationPage` already
existed and already did everything the popup did (`SelectFromPreviousGeolocations`: current
location / saved addresses / add new). The only real gap was what happened *afterward*,
which the `goBack()` fix covers.

**Return-to-caller.** `goToLinkedDestination` already existed specifically to finish a
deep-link flow that got interrupted to ask for an address; extending its "otherwise" branch
to prefer going back (when possible) rather than hardcoding Home fixes this for every
existing caller at once (checkout, `AppHeader`'s address tap, anywhere else that opens this
flow later) - not a checkout-specific special case.

**Detection is a suggestion, not a lock.** `describeCoords` is best-effort (device
geocoder, falls back to nearest known city, falls back further to nulls on total failure -
unchanged from its `GeolocationFinder` days). The fields stay fully editable; typing in
either one immediately marks the pre-fill "edited" so a slow geocode reply landing after
the client already started correcting it cannot clobber what they wrote.

## Backend gaps

None - `describeCoords` already existed and already coped with no reverse-geocoding
service being available; this just gives a second screen access to the same coping logic.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles - confirms nothing still
  imports the deleted `AddressPickerSheet.jsx`) and reading every changed file back; not
  opened on a device.
- Worth a manual pass on the return-navigation change specifically: checkout → "Изменить
  адрес" → pick a saved address → should land back on checkout with the new address
  already showing; same starting from the top-bar address tap on Home/PubInfo/etc.
- Reverse geocoding on `SelectGeolocationInputs` inherits every existing limitation of
  `describeCoords` (device geocoder availability, network, simulator support) - on a
  device/network where it already silently failed for `GeolocationFinder`, it will
  silently fail here too and the fields stay blank, same as before this change.
