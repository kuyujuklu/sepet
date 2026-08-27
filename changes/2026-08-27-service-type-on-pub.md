# Service type is the pub's field now (app side)

Date: 2026-08-27
Scope: `app` — comments only. The functional change is in the backend and `admin-front`;
see `../../backend/changes/2026-08-27-service-type-moves-to-pub.md`.

## What & why

`service_type` moved from the category to the pub: a pub serves one kind of service and
it is set in the pub settings popup, instead of being derived from whatever its
categories happened to be tagged with.

The app needed **no functional change**. It already reads `pub.section` /
`pub.service_types` and `dish.service_type`, and it never read `category.service_type` —
that is what the earlier
`changes/2026-08-27-adopt-backend-api-additions.md` work put in place. The comments
describing *where those fields come from* were wrong after the move, so they were
corrected.

## Files

Modified, comments only:

- `src/shared/utils/sections.js` — a pub declares its section rather than deriving it;
  `matchesSection` explains that a dish carries the section of the pub selling it.
- `src/shared/utils/topDishes.js` — the dish's `service_type` is stamped from the pub.
- `src/shared/api/pubs/pubsApi.js`, `src/shared/api/categories/categoriesApi.js`,
  `src/shared/hooks/useNearbyCategoryNames.js`, `src/widgets/Pub/PubsList.jsx` — `?section=`
  filters on the pub's own field.

## How it works

`pubMatchesSection` still reads the `service_types` **list** before falling back to
`section`, even though the list now always has exactly one entry. That is deliberate: it
costs nothing and means the app needs no change if a pub is ever allowed to serve two
sections.

One behaviour worth knowing, which comes from the server and not from here: a category
belongs to its pub's section now, so a `fast_food` category inside a flower shop is a
flowers category. `useNearbyCategoryNames(section)` will therefore return `fast_food` as
a chip in the flowers section for that pub. That is the intended semantics of the move —
the establishment decides — but it is a visible difference from the old slug-based rule.

## Backend gaps

- `missing data` — **a pub cannot serve two sections.** `service_types` is a list on the
  wire and the client handles a list, but the server always sends one entry. A pub that
  genuinely sells both food and bouquets has to pick one.
- `missing data` — **no service type at pub creation.** Not an app concern directly, but
  a newly created pub shows up in food until someone edits it in the panel.
- Unchanged from the previous note: no `?q=` on the feed, no category icons, no orders
  pagination, no ETA per status.

## Known limits / follow-ups

- Nothing in the app was re-tested against a live server beyond the bundle building; the
  endpoint responses were verified directly against the local backend (see the backend
  note) and the field names the app reads were checked against them.
- `src/shared/utils/sections.js` still exports `matchesSection` used only by
  `searchDishes`. If dish search ever moves server-side (`?q=` on the feed), that helper
  and the last section logic in the client go with it.
