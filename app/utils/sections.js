// The top-level sections of the site (food / flowers / groceries).
//
// A pub's section is a field on the pub: the backend returns `section` (the
// answer) and `service_types` (the same answer as a one-element list) on
// every pub object, filled from `pubs.service_type`, which is set once in the
// admin panel's pub settings.
//
// This used to guess: it classified a pub by the `category_types` slugs of
// its categories, and because the listing endpoint returns no categories at
// all, it fell back to a hardcoded table of six pub ids. Any pub added after
// that table was written was silently filed under food. Both the guess and
// the table are gone - see backend `changes/2026-08-27-service-type-moves-to-pub.md`.

export const sectionIds = {
  food: "food",
  flowers: "flowers",
  groceries: "groceries",
};

export const defaultSectionId = sectionIds.food;

export const isKnownSection = (sectionId) =>
  Object.values(sectionIds).includes(sectionId);

// A pub that predates the field (or an endpoint that doesn't fill it) sells
// food - the same default the server applies in ServiceTypeOrDefault.
export const getPubSection = (pub) => {
  const section = pub?.section ?? pub?.service_types?.[0];

  return isKnownSection(section) ? section : defaultSectionId;
};

export const pubMatchesSection = (pub, sectionId) => {
  if (!isKnownSection(sectionId)) return true;

  // `service_types` is a list because a pub serving two sections is a
  // plausible thing to want later; today it always holds exactly one.
  const serviceTypes = Array.isArray(pub?.service_types) ? pub.service_types : [];
  if (serviceTypes.length) return serviceTypes.includes(sectionId);

  return getPubSection(pub) === sectionId;
};

// Every dish of a pub carries its pub's section, so a dish is classified by
// the same field rather than by joining through its category's slugs.
export const dishMatchesSection = (dish, sectionId) => {
  if (!isKnownSection(sectionId)) return true;

  return (dish?.service_type ?? defaultSectionId) === sectionId;
};
