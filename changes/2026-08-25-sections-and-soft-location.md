# Sections (food / flowers / groceries) and a non-blocking location

Date: 2026-08-25

## What & why

Two changes to the entry of the app, asked for together:

1. The first screen is now a **section picker** — еда / цветы / продукты — instead of
   the address wizard. The chosen section is switchable from the top bar, so a client
   who came for food can jump to flowers and back without restarting anything.
2. **Picking a location is no longer mandatory to see products.** The app guesses a
   coarse location (device GPS, or a city from a light picker if the permission was
   refused) and shows the feed immediately; the exact delivery address is collected at
   checkout, where it is also remembered for the next time.

The owner's decisions that shape this: sections are derived from `category_types`
only (no backend field exists); groceries are shown as **«Скоро»** because no
establishment is tagged as one; a denied permission falls back to a **city list**, not
to a map; and the picker is shown **on every launch** (the choice is not remembered).

## Files

### Added

- `src/shared/utils/sections.js` — the section taxonomy and the single filtering rule
  used by every screen. Sections are defined over `category_types` slugs, in two
  shapes: `include` (only these slugs belong here — flowers) and `exclude` (everything
  but these — food). Exports `sectionsList`, `getSection`, `slugsMatchSection`,
  `categoryMatchesSection`, `filterCategoryNamesBySection` and the translation-key
  helpers (`getSectionTitleKey`, `getSectionPubsTitleKey`, `getSectionFeedSubtitleKey`).
- `src/features/store/sections/sectionSlice.js` — `{ section }`, `setSection`,
  `selectSection` (falls back to food), `selectSelectedSection` (raw, `null` = not
  chosen yet). Not persisted, on purpose: the picker is shown on every launch.
- `src/pages/Sections/SectionPickerPage.jsx` — the first screen. Logo, one question,
  three cards. Asks for nothing else; a deep link skips it entirely.
- `src/widgets/Sections/SectionCard.jsx` — a card in the picker; the unavailable one
  keeps its place with a «Скоро» badge instead of disappearing.
- `src/widgets/Sections/SectionSwitcher.jsx` — the compact pills in the top bar.
  Dispatches `setSection` and calls back so the screen can drop its category filter.
- `src/shared/utils/cities.js` — coarse coordinates of the 8 cities we deliver in plus
  `defaultCity` (Chișinău). Replaces the literal `47.00367 / 28.907089` that used to
  sit in two widgets.
- `src/widgets/Geolocation/CityPicker.jsx` — the fallback when the location permission
  is refused: a plain list of cities, no map, no street, plus a link to the system
  settings. Writes an approximate geolocation.
- `src/shared/utils/savedAddresses.js` — `readSavedAddresses` / `appendSavedAddress`,
  the AsyncStorage `saved_addresses` list in one place, deduplicated on
  town + fullAddress (checkout now saves an address on every order).
- `src/shared/hooks/useLinkedDestination.js` — resolves a deep link to
  `{screen, params}` and navigates, or falls back to Home. This logic used to be
  copy-pasted inside the geolocation wizard, which was the entry screen; the wizard is
  not the entry point any more, so it had to move out or deep links would have broken.

### Modified

- `App.js` — `Screens.SectionPicker`, registered as the screen and as
  `initialRouteName` (was `SelectGeolocationPage`).
- `src/features/store/configureStore.js` — `section` reducer.
- `src/features/store/geolocation/geolocationSlice.js` — new
  `setApproximateGeolocation` (writes `{lat, lng, cityId, isApproximate: true}` and
  **refuses to overwrite an address the client actually typed**) and
  `selectIsApproximateGeolocation`.
- `src/widgets/Geolocation/GeolocationFinder.jsx` — rewritten: it now bootstraps the
  whole app's location. On a granted permission it writes both `nearGeolocation` and
  the approximate `geolocation`; on a denial it writes nothing and the city picker
  takes over.
- `src/widgets/AppHeader/AppHeader.jsx` — `showSections` / `onSectionChange` / `screen`
  props render the switcher as a second row. The address label is now three-state:
  a real address, `«<город> · уточнить адрес»` while the location is approximate, or
  `header.set_address`.
- `src/pages/Home/Home.jsx` — section-aware (feed + carousel), clears the category on
  a section change, and handles "we do not know where the client is": city picker when
  the permission was refused (or on request), spinner + «Выбрать город вручную» while
  the position is still resolving.
- `src/widgets/TopDishes/TopDishesList.jsx`, `useTopDishes.js`,
  `src/shared/utils/topDishes.js` — a `sectionId` flows down to `buildTopDishes`, which
  filters on the resolved slugs of the dish (`getDishSlugs`, extracted from the old
  `matchesCategory`). Feed subtitle and the "all pubs" link are section-specific.
- `src/pages/FoodCategories/FoodCategoriesPage.jsx` +
  `src/widgets/FoodCategories/CategoriesList/CategoryWithPubInfoList.jsx` — the same
  section rule filters the pub list, and the title of the screen is the section name
  («Все цветочные»), not the hardcoded «Рестораны».
- `src/widgets/Orders/CreateOrder/CreateOrder.jsx` — a warning banner + «Указать адрес
  на карте» while the location is approximate; the `!location` branch **returns** now
  (it used to only push an alert and then POST `lat: undefined`); on a successful order
  the typed address is written into `geolocation` and appended to `saved_addresses`.
- `src/pages/Geolocation/SelectGeolocationPage.jsx` — an `AppHeader showBack` on the
  first step: the screen is reached from the top bar now and had no way back.
- `src/widgets/Geolocation/SelectGeolocationInputs.jsx`,
  `SelectFromPreviousGeolocations.jsx` — use `useLinkedDestination` and
  `appendSavedAddress`; a dead `handleSelectLocationByYourself` that called
  `setCenter`/`setZoom` (neither exists in that component) was removed.
- `src/widgets/Geolocation/SelectGeolocation.jsx` — uses `defaultCity`.
- `src/widgets/Orders/OrdersList/OrderCard.jsx`, `OrderInfo.jsx` — `location?.lat` and
  `skip: !location`; both used to throw on a null location, which is now reachable.
- `src/widgets/Auth/*Form.jsx` (3 files, 4 call sites) — after login / registration /
  password change the client goes to `Home`, not to the address wizard.
- `src/shared/analytics/events.js` — `section_selected`, `section_unavailable`,
  `city_selected`.
- `assets/locales/{ru,ro,gz}.js` — `sections.*` (headline, subheadline, coming_soon,
  coming_soon_alert and title/subtitle/pubs/feed_subtitle per section), `cities.*`,
  `city_picker.*`, `header.specify_address`,
  `create_order_page.additional_data.{no_location,approximate_location,pin_on_map}`.
  **ro/gz are my translations and need a native check** — the Gagauz section names in
  particular.

## How it works

**Sections over `category_types`.** The backend has no section field anywhere, and the
only classifier it sends is `category_types[]` on a category of a pub. So a section is
a rule over those slugs, evaluated in exactly one function (`slugsMatchSection`) that
every screen calls:

```
flowers → include ["flowers"]   : only categories carrying the slug
food    → exclude ["flowers"]   : everything else, including untagged categories
groceries → include []          : matches nothing (and is not selectable anyway)
```

The asymmetry is deliberate and load-bearing: most categories carry **no** usable slug,
so an `include` rule for food would have emptied the feed. An `exclude` rule keeps
untagged dishes in food, where they almost always belong, and the narrow, well-tagged
flowers set is safe to match positively.

A dish only has `category_id`, so its slugs are resolved through
`categorySlugsById` (from `get-available-categories`, already in the RTK Query cache)
and, failing that, through the categories of the pub's own menu — that is the
`getDishSlugs` helper in `topDishes.js`.

Inside a section built on `include`, `filterCategoryNamesBySection` returns an empty
list, so the category carousel hides itself: in the flowers section every category is
"flowers" and a one-chip carousel would be noise.

**Startup without an address.** `initialRouteName` is the section picker.
`GeolocationFinder` (mounted outside the navigator, so it runs from the first frame)
asks for the coarse position and writes it as an approximate geolocation — that is
enough for every nearby-* endpoint, which only ever needs lat/lng. `setApproximateGeolocation`
refuses to overwrite a geolocation that has no `isApproximate` flag, so a real address
typed by the client always wins over a later GPS fix.

If the permission is refused there is no reverse-geocoding anywhere in the client and
nothing to guess from, so Home renders `CityPicker`, and the picked city writes the
same kind of approximate value (plus `cityId`, which is what the top bar shows).

**Where the exact address is asked for.** At checkout, which already had validated
town + full-address inputs — they were simply never written back. Now a successful
order writes them into `geolocation` (dropping the approximate flag) and appends them
to `saved_addresses`, so the top bar, the address wizard and the next checkout all show
the real address. While the flag is still set, checkout shows a banner pointing to the
map, because the order is posted with **approximate coordinates** (see below).

**Deep links.** They used to be resolved inside the geolocation wizard, because the
wizard was the first screen everybody had to pass through. It is not any more, so the
resolution moved into `useLinkedDestination`, and the section picker navigates straight
to the linked screen (with the default section) instead of asking its question.

## Backend gaps

- `API change needed` — **there is no section on a pub.** A pub belongs to a section
  only because one of its categories happens to carry a `category_types` slug. Needed:
  `section` (or `shop_type`) on the pub object of `/pubs/get-nearby-pubs` and of
  pub-info, with the values `food | flowers | groceries`. Once it lands, the client can
  drop `slugsMatchSection`, the include/exclude asymmetry and the whole
  `getDishSlugs` join, and simply filter pubs by one field.
- `missing data` — **nothing identifies a grocery store.** No slug, no flag, no pub.
  The groceries card is a hardcoded «Скоро» in `sectionsList` and has to be flipped by
  hand (`available: true`) once real establishments exist. The client cannot detect
  them on its own.
- `missing data` — **no reverse-geocoding, in either direction.** The client cannot
  turn coordinates into a city/street (so an approximate location shows a city name
  only if the client picked one from the list — a GPS fix shows «Указать адрес
  доставки»), and it cannot turn the address typed at checkout into coordinates. As a
  result **an order created from an approximate location is posted with city-level
  lat/lng and an exact address string**, and the courier has to rely on the string.
  Needed: `GET /geo/reverse?lat&lng` → `{town, street}` and
  `GET /geo/search?q=` → `{lat, lng}`; or, at minimum, let the order carry the address
  without coordinates and geocode it server-side.
- `missing data` — **no city dictionary.** `src/shared/utils/cities.js` is a hardcoded
  list of 8 cities with hand-picked coordinates; a new delivery city needs an app
  release. Needed: `GET /geo/cities` → `[{id, name_ru, name_ro, name_gz, lat, lng}]`.
  That would also remove the `cities.*` locale keys.
- `missing data` — categories still have no server-side localized dictionary and dishes
  still carry no category slug of their own (both already recorded in
  `2026-08-24-navigation-rework.md`); the section rule makes this worse, because a
  mis-tagged category now moves a whole pub between sections.
- Still open from earlier notes: no dish popularity counter, no aggregated top-dishes
  endpoint, no stop-list, no stable analytics id / tracking consent.

## Known limits / follow-ups

- **Coordinates of an order can be city-level.** This is the sharpest edge of the
  change: the client confirms a text address at checkout but the coordinates stay
  approximate until reverse-geocoding exists. The banner on the checkout screen is a
  mitigation, not a fix — the client has to notice it and tap through to the map.
- `sectionsList` order is the display order and groceries is last; flipping it to
  `available: true` is the only change needed when real stores appear.
- The flowers section hides the category carousel entirely. If flower shops ever start
  tagging categories (bouquets / plants / gifts), the section will need its own slug
  list rather than the current single-slug `include`.
- The section is not remembered between launches, as asked. If that changes, persist it
  in AsyncStorage next to `lang`, and skip the picker when a value exists.
- `src/widgets/Pub/PubList.jsx` and `src/widgets/Maps/PubsMap.jsx` are now dead (the old
  home screen was their only caller) and both read `location.lat` unguarded. They were
  left in place, not deleted; if they are ever remounted they will crash on a null
  location.
- Nothing was run on a device in this session. Verification was static: every file
  parsed with babel (`npm run lint` is broken repo-wide), every relative import resolved,
  all new locale keys checked to exist in all three files, and the section rules +
  `buildTopDishes` filtering covered by a throwaway node test (untagged dish stays in
  food, flowers-only dish leaves it, category filter still narrows inside a section).
  Worth a manual pass: section picker → Home → switch to flowers → back to food, a
  denied-permission cold start, and a full order from an approximate location.

---

## 2026-08-25 (later) — naming the approximate location, and wiring it to checkout

The startup flow worked but said nothing: with a granted permission the top bar still
read «Указать адрес доставки», and checkout showed empty address fields, so nobody could
tell where the order was going.

### Reverse geocoding, with a fallback

`GeolocationFinder` now describes the coordinates it gets (`describeCoords`):

1. `Location.reverseGeocodeAsync` — the on-device geocoder, which we did have all along;
   it gives `city` / `subregion` and `street` + `streetNumber`.
2. If it throws or returns nothing (no Play services, no network, a simulator), the
   nearest city we deliver in is used: `getNearestCity(coords, maxDistanceKm = 35)` in
   `shared/utils/cities.js`, a flat-earth distance over the eight hardcoded cities. Beyond
   35 km it returns null and we simply say "near you".

The result is stored on the approximate geolocation as `town` / `fullAddress` / `cityId`
— the same shape a typed address has, with `isApproximate` still true.

### One wording for "where is this going"

`shared/utils/geolocation.js`:

- `getLocationLabel(location, t)` — «Кишинёв, ул. Пушкина» → «Кишинёв» → the city name →
  «Рядом с вами» → `null` only when there really is nothing. Used by the top bar, the
  address screen and checkout, so the three can never disagree.
- `isAddressComplete(location)` — town + street **and** not approximate.

The top bar prints that label and, while the location is approximate, a small caption
under it: «Определено по геолокации · нажмите, чтобы уточнить». It never claims we have
no idea where the client is while the feed is happily showing nearby pubs.

### Checkout knows the address now

- A "Заказ доставим сюда" block at the top of the address card, with the same label and
  the approximate warning folded into it (the separate orange banner is gone).
- Two buttons: «Из сохранённых» → `AddressPickerSheet`, and «Указать на карте» →
  the address screen.
- `AddressPickerSheet` (`widgets/Orders/CreateOrder/`) lists every saved address, marks
  the one in use, and on tap **dispatches `setGeolocation` with that address's own
  lat/lng** — not just filling the two inputs. Picking a saved address at checkout now
  actually moves the order to those coordinates, which is what "не понятно куда заказывает"
  was really about.

### The address screen was rebuilt

`SelectFromPreviousGeolocations` is no longer a logo with three green pills:
«Текущее местоположение» (use what we guessed and carry on), then **all** saved addresses
as cards with a delete button (the list used to be capped at three with no way to the
rest), then a primary «Добавить новый адрес». `SelectGeolocationInputs` (step two, after
the map) became a card with a "point chosen · change" strip, a real primary button and a
proper hint about what the two fields are for. `SelectGeolocationPage` keeps only the
step machine; both widgets dropped native-base entirely.

### Backend gaps — one downgraded

The **reverse-geocoding** gap recorded above is now partly covered on the client: the
device geocoder names the coordinates. What is still missing is the **forward** direction
— turning the address typed at checkout into coordinates. An order placed from an
approximate location is still sent with device/city-level lat/lng plus an exact address
string. `GET /geo/search?q=` (or server-side geocoding of the order address) remains the
fix. The device geocoder is also unavailable on some Android builds, which is exactly why
the nearest-city fallback exists.

New locale keys (all three files, ro/gz need a native check): `header.{near_you,
approximate_hint}`, `select_geolocation.{title,subtitle,current_section,use_current,
no_saved_title,no_saved_text,add_address_inputs_hint,point_on_map,change_point,
save_address}`, `create_order_page.address.{current,unknown,choose_saved,saved_title,
no_saved,add_new}`.
