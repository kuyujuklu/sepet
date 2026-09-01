import { images } from "../../app/images/images";

// The top-level sections of the app (food / flowers / groceries).
//
// These ids are the server's `service_type` values verbatim, which is what
// makes this file so small now: a section is no longer a rule the client
// evaluates over `category_types`, it is a field on the pub. A pub declares
// which one of the three it is (`section`, plus `service_types` carrying the
// same answer as a one-element list), every dish of that pub is stamped with
// it, and `?section=` filters the pub, category and feed endpoints
// server-side. The include/exclude asymmetry, the per-pub overrides and the
// dish -> category -> slug join are all gone with it.
//
// What is left here is presentation: which icon a section gets and where its
// texts live.

export const sectionIds = {
  food: "food",
  flowers: "flowers",
  groceries: "groceries",
};

export const sectionsList = [
  {
    id: sectionIds.food,
    image: images.AllFoodHighQuality,
  },
  {
    id: sectionIds.flowers,
    image: images.Flowers,
  },
  {
    id: sectionIds.groceries,
    // No grocery icon in the assets; the cart is the closest neutral one
    image: images.Cart,
  },
];

export const defaultSectionId = sectionIds.food;

export const getSection = (sectionId) =>
  sectionsList.find((section) => section.id === sectionId) ?? null;

export const getSectionImage = (sectionId) => getSection(sectionId)?.image ?? null;

// A pub belongs to exactly one section - the one set in its settings. The
// `service_types` list is still read first because that is what the server
// sends alongside `section`, and reading the list keeps this working
// unchanged if a pub is ever allowed to serve two.
export const pubMatchesSection = (pub, sectionId) => {
  if (!sectionId) return true;
  if (!pub) return false;

  if (Array.isArray(pub.service_types) && pub.service_types.length > 0) {
    return pub.service_types.includes(sectionId);
  }

  // A response from before the field existed reads as food, which is what
  // every pub was then.
  return (pub.section ?? sectionIds.food) === sectionId;
};

// A dish carries the `service_type` of the pub selling it - every dish of one
// pub has the same one, which is why search can filter on the dish alone.
export const matchesSection = (entity, sectionId) =>
  !sectionId || (entity?.service_type ?? sectionIds.food) === sectionId;

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
