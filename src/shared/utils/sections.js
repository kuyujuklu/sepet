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
    // No pub is tagged as a grocery today - the card is shown as "coming soon"
    available: false,
    include: [],
  },
];

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
export const pubMatchesSection = (categoriesOfPub = [], sectionId) => {
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
