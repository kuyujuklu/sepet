// The top-level sections of the site (food / flowers / groceries).
//
// Ported from the mobile app's src/shared/utils/sections.js - same backend,
// same problem: there is no `section`/`shop_type` field on a pub, only
// `category_types` slugs on a pub's *categories*, and most categories carry
// no usable slug at all. Two rule shapes, same reasoning as mobile:
//  - `include` - only categories carrying one of these slugs belong here
//    (flowers: a narrow, well-tagged set);
//  - `exclude` - everything belongs here except these slugs (food: most
//    categories are untagged, and dropping them would empty the feed).

export const sectionIds = {
  food: "food",
  flowers: "flowers",
  groceries: "groceries",
};

export const sectionsList = [
  { id: sectionIds.food, exclude: ["flowers"] },
  { id: sectionIds.flowers, include: ["flowers"] },
  { id: sectionIds.groceries, include: [] },
];

// Manual per-pub overrides, keyed by pub id - identical values to the mobile
// app's pubSectionOverrides (same backend, same live pubs), since the home
// listing endpoint here (`get-available-pubs`) doesn't return a pub's
// categories at all, so the override map is the only classifier that works
// at that level. See mobile's `app/src/shared/utils/sections.js` and
// `app/changes/2026-08-27-pub-section-overrides.md` for how these were found
// (live API probing on 2026-08-27) - revisit if the backend ever ships a
// real section field.
const pubSectionOverrides = {
  70: sectionIds.flowers, // Rray_decor
  41: sectionIds.flowers, // FloraDelivery
  48: sectionIds.groceries, // Дары природы
  72: sectionIds.groceries, // Магазин Mars
  53: sectionIds.groceries, // Магазин Люкс
  44: sectionIds.groceries, // Алёнушка
};

export const getPubSectionOverride = (pubId) =>
  pubSectionOverrides[pubId] ?? null;

export const defaultSectionId = sectionIds.food;

export const getSection = (sectionId) =>
  sectionsList.find((section) => section.id === sectionId) ?? null;

// Does a set of category slugs belong to the section? An untagged category
// (no slugs at all) stays in an `exclude` section and is dropped from an
// `include` one.
export const slugsMatchSection = (slugs = [], sectionId) => {
  const section = getSection(sectionId);
  if (!section) return true;

  const list = Array.isArray(slugs) ? slugs : [];

  if (section.include) {
    return list.some((slug) => section.include.includes(slug));
  }

  if (section.exclude) {
    return !list.some((slug) => section.exclude.includes(slug));
  }

  return true;
};

export const categoryMatchesSection = (category, sectionId) =>
  slugsMatchSection(category?.category_types, sectionId);

// A pub belongs to a section when at least one of its categories does (or
// the override map says so). `categoriesOfPub` is usually empty here - the
// home listing endpoint doesn't return per-pub categories - so this mostly
// resolves through the override map, exactly like mobile's home feed.
export const pubMatchesSection = (categoriesOfPub = [], sectionId, pubId) => {
  const override = getPubSectionOverride(pubId);
  if (override) return override === sectionId;

  if (!categoriesOfPub.length) return slugsMatchSection([], sectionId);

  return categoriesOfPub.some((category) =>
    categoryMatchesSection(category, sectionId),
  );
};
