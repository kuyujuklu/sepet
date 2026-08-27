# Manual section overrides for 6 pubs (flowers/groceries leaking into food)

Date: 2026-08-27

## What & why

Screenshot-driven bug report: the Home "Хиты" feed (Еда section) was showing a gypsum
ashtray from a flower/decor shop (Rray_decor) as a "hit", and separately the client asked
to have specific establishments show under the right section: Rray_decor and FloraDelivery
are flower shops, Дары природы/Магазин Mars/Магазин Люкс/Алёнушка are groceries/kiosks.

Confirmed the mechanism by reading these pubs' real data straight from the live API
(`GET /api/client/pub/<url_name>`, public/unauthenticated, read-only):

```
Rray_decor      (id 70)  Букеты[flowers], Подарки[other], Сувениры из гипса[other],
                          Наборы из гипсового декора[other], Комнатные цветы[flowers],
                          Уличные цветы[other], Свечи[other]
FloraDelivery   (id 41)  Альстромерия/Эустома/Комнатные цветы/Гербера/Розы/Хризантемы
                          [flowers], Воздушные шары[flowers], Мягкие игрушки[flowers],
                          Сладости[other]
Дары природы    (id 48)  Овощи[other], Фрукты[other]
Магазин Mars    (id 72)  Коньяк/Шампанское/Водка[alcohol], Пиво/Вино/Горячие напитки[other]
Магазин Люкс    (id 53)  everything [other] (baby food, cigarettes, beer, snacks...)
Алёнушка        (id 44)  everything [other] (alcohol, snacks, fish, cold cuts...)
```

Two distinct failure modes, both already anticipated in
`changes/2026-08-25-sections-and-soft-location.md`'s Backend gaps section:

1. Rray_decor/FloraDelivery are genuinely flower shops, but part of their own catalog
   (gift wrap, gypsum souvenirs, candles, sweets) is tagged `other` - identical to an
   untagged restaurant category - so those specific dishes matched food's `exclude:
   [flowers]` rule and leaked into the food feed.
2. Дары природы/Mars/Люкс/Алёнушка have **no** distinguishing tag anywhere in their
   catalog - everything is `other` or `alcohol`. There is no slug-based rule that could
   ever place them in groceries; they fall into food by the same `exclude` rule, with
   nothing to catch and redirect them.

## Files

### Modified

- `src/shared/utils/sections.js` — `pubSectionOverrides`: a plain `{ pubId: sectionId }`
  map for these 6 pubs, plus `getPubSectionOverride(pubId)`. `pubMatchesSection` takes a
  new (optional, but always-pass-it-when-you-have-it) `pubId` argument and checks the
  override before falling back to the slug-based rule. `sectionsList`'s `groceries` entry
  flipped `available: true` - the comment on that line already said this was the exact
  trigger for flipping it ("once real establishments exist").
- `src/shared/utils/topDishes.js` — `getPubDishes` resolves `getPubSectionOverride(pub?.id)`
  once per pub and uses it in place of `slugsMatchSection` for the section-membership
  check (category-slug narrowing inside the section, e.g. an active category chip, is
  untouched and still uses the dish's real tags).
- `src/widgets/Pub/PubsList.jsx` — passes `pub.id` into `pubMatchesSection`.

## How it works

Both call sites that decide section membership (`PubsList`'s establishments filter,
`topDishes.js`'s per-dish feed filter) now check the pub-id override **first**; only a
pub with no override falls through to the existing category_types rule. The override is
absolute per pub - once a pub is overridden to `groceries`, *none* of its dishes match
`food` or `flowers` any more, and *all* of them match `groceries`, regardless of what an
individual category happens to be tagged. That is deliberate: the override exists because
individual category tags on these pubs cannot be trusted at all, not just for the specific
items that happened to surface the bug.

Verified directly (not just read): a standalone script exercised `pubMatchesSection` with
each of the 6 pubs' real category lists (fetched from the live API above) plus one
ordinary untagged restaurant as a control - every pub now resolves to exactly one section,
and the control pub is unaffected (still food-only).

## Backend gaps

Unchanged from `changes/2026-08-25-sections-and-soft-location.md`: there is still no
`section`/`shop_type` field on a pub. This change is exactly the "flip a hardcoded map by
hand" stopgap that note already predicted would be needed - it does not reduce the size of
that gap, it just papers over 6 known instances of it. `pubSectionOverrides` will need a
new entry by hand for every future non-food pub until the backend ships a real field.

## Known limits / follow-ups

- Verified with `npx expo export --platform android` (compiles) and a standalone node
  script run against each pub's actual live category data; not exercised inside the
  running app on a device.
- The override list is a static, hand-maintained map with **no expiry and no source of
  truth check** - if any of these 6 pubs' categories ever get properly tagged upstream, or
  the pub is renamed/re-themed, this file will not know and will keep forcing the old
  section. Worth a periodic manual re-check against the live API, same way this fix was
  verified.
- Did not go looking for other mis-tagged pubs beyond the 6 named ones - there may be more
  out there with the same `other`-only tagging that nobody has reported yet.
