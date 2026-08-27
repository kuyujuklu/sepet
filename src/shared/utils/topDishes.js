import { getDiscountPercent, isDishAvailable } from "./dish";
import { matchesSection } from "./sections";

// The filters of the home feed. These are the server's `?filter=` values -
// ranking, interleaving and paging all happen in
// GET /api/client/get-available-top-dishes now, so there is no client-side
// `scoreDish` heuristic left to keep in sync with them.
export const topDishesFilters = {
  top: "top",
  deals: "deals",
};

const isOrderableDish = (dish) =>
  !!dish && dish.visible !== false && !isNaN(+dish.price) && +dish.price > 0;

// Dish-name search across the menus already loaded.
//
// The feed endpoint has no `?q=`, so search is still the one thing built on
// the client, out of the per-pub menus useTopDishes loads only while search is
// open. It is a name match, not a "best of" pick: every match earns its place,
// from every pub, with no per-pub cap and no interleave.
//
// The section check is a field comparison now (`service_type`, stamped onto
// every dish from the pub selling it) instead of the dish -> category -> slug
// join.
export const searchDishes = (
  pubsWithMenus = [],
  { query = "", sectionId = null, limit = 40 } = {},
) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const results = [];

  for (const menu of pubsWithMenus) {
    const pub = menu?.pub;

    for (const dish of menu?.dishes || []) {
      if (!isOrderableDish(dish)) continue;
      if (!matchesSection(dish, sectionId)) continue;

      const name = dish?.name?.toLowerCase() ?? "";
      if (!name.includes(normalizedQuery)) continue;

      results.push({
        key: `${pub?.id}-${dish?.id}`,
        dish,
        pub,
        discountPercent: getDiscountPercent(dish),
        // A name that starts with the query reads as more relevant than one
        // that just happens to contain it somewhere in the middle
        rank: name.startsWith(normalizedQuery) ? 0 : 1,
      });
    }
  }

  results.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;

    // A sold-out dish is still a valid answer to "do you have пицца?", but it
    // belongs under the ones that can actually be ordered
    const aAvailable = isDishAvailable(a.dish);
    const bAvailable = isDishAvailable(b.dish);
    if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;

    return 0;
  });

  return results.slice(0, limit);
};
