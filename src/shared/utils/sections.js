import { categories } from "../../app/static-data/data";
import { images } from "../../app/images/images";
import { placeholderCategories } from "./foodCategories";

// The top-level sections of the app (food / flowers / groceries).
//
// The backend has no notion of a section: the only classifier it sends is
// `category_types` on a *category* of a pub. So a section is defined here as a
// rule over those slugs, and every screen filters with the same rule.
//
// Rules come in two shapes on purpose:
//  - `include` - only categories carrying one of these slugs belong here
//    (flowers: a narrow, well-tagged set);
//  - `exclude` - everything belongs here except these slugs (food: most
//    categories carry no usable slug at all, and dropping them would empty
//    the feed).

export const sectionIds = {
  food: "food",
  flowers: "flowers",
  groceries: "groceries",
};

export const sectionsList = [
  {
    id: sectionIds.food,
    image: images.AllFoodHighQuality,
    available: true,
    // Everything that is not a bouquet
    exclude: [categories.Flowers],
  },
  {
    id: sectionIds.flowers,
    image: images.Flowers,
    available: true,
    include: [categories.Flowers],
  },
  {
    id: sectionIds.groceries,
    // No grocery icon in the assets; the cart is the closest neutral one
    image: images.Cart,
    // The first real grocery pubs exist now (see pubSectionOverrides below) -
    // flipped by hand, exactly as this comment used to say it would be
    available: true,
    include: [],
  },
];

// Manual per-pub overrides, keyed by pub id.
//
// The backend still has no `section`/`shop_type` field on a pub (see the
// Backend gaps section of changes/2026-08-25-sections-and-soft-location.md) -
// a pub only ends up in a section because *some* of its categories happen to
// carry a usable `category_types` slug. That breaks down for two real,
// currently-live pubs:
//  - Rray_decor (id 70) and FloraDelivery (id 41) are flower shops, but part
//    of their own catalog (gift wrap, gypsum souvenirs, candles) is tagged
//    "other" like everything else untagged - so those specific dishes leaked
//    into the food feed's "Хиты" (a gypsum ashtray showing up as a food hit).
//  - Дары природы (48), Магазин Mars (72), Магазин Люкс (53) and Алёнушка
//    (44) are grocery/kiosk shops. Every one of their categories is tagged
//    "alcohol" or "other" - identical to how an untagged restaurant category
//    reads - so there is no slug-based rule that could ever place them in
//    groceries instead of food.
// Confirmed against the live API (GET /api/client/pub/<url_name>) on
// 2026-08-27; revisit if any of these pubs' categories ever get a real
// category_types tag, or once the backend ships a proper section field.
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

// Does a set of category slugs belong to the section?
// An untagged category (no slugs at all) stays in an `exclude` section and is
// dropped from an `include` one.
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

// A pub belongs to a section when at least one of its categories does. Note it
// is NOT "all of its slugs match": a place selling both food and bouquets
// belongs to both sections, and a pub whose categories we do not know yet is
// treated as untagged (so it stays in food and disappears from flowers).
//
// `pubId` is optional only so existing tests/callers that never had a pub id
// handy do not break - always pass it when one is available, or an
// overridden pub silently falls back to the (wrong) slug-based rule.
export const pubMatchesSection = (categoriesOfPub = [], sectionId, pubId) => {
  const override = getPubSectionOverride(pubId);
  if (override) return override === sectionId;

  if (!categoriesOfPub.length) return slugsMatchSection([], sectionId);

  return categoriesOfPub.some((category) =>
    categoryMatchesSection(category, sectionId),
  );
};

// Which carousel chips make sense inside the section. A section built on
// `include` shows no carousel at all (its slugs *are* the section), so the
// caller gets an empty list and hides the row.
export const filterCategoryNamesBySection = (names = [], sectionId) => {
  const section = getSection(sectionId);
  if (!section) return names;

  if (section.include) return [];

  return names.filter(
    (name) => placeholderCategories[name] && slugsMatchSection([name], sectionId),
  );
};

export const getSectionTitleKey = (sectionId) =>
  sectionId ? `sections.${sectionId}.title` : "sections.food.title";

export const getSectionSubtitleKey = (sectionId) =>
  sectionId ? `sections.${sectionId}.subtitle` : "sections.food.subtitle";

// Subtitle of the feed on the home screen
export const getSectionFeedSubtitleKey = (sectionId) =>
  sectionId ? `sections.${sectionId}.feed_subtitle` : "sections.food.feed_subtitle";

// The "show every establishment of this section" chip on the home screen
// ("Все рестораны" / "Все цветочные" / "Все продуктовые") - a dedicated
// string per section rather than "Все " + the section title, because that
// concatenation does not read as a real phrase in Russian
export const getSectionPubsLabelKey = (sectionId) =>
  sectionId
    ? `sections.${sectionId}.all_pubs_label`
    : "sections.food.all_pubs_label";
