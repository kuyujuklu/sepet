import { getDiscountPercent, hasDiscount } from "./dish";
import { slugsMatchSection } from "./sections";

export const topDishesFilters = {
  top: "top",
  deals: "deals",
  near: "near",
};

// How many dishes of one pub can get into the feed - so that the biggest
// menu nearby does not push everybody else out. A category filter leaves far
// fewer matching dishes per pub, so the cap is raised then.
const MAX_DISHES_PER_PUB = 4;
const MAX_DISHES_PER_PUB_IN_CATEGORY = 8;

const isOrderableDish = (dish) =>
  !!dish && dish.visible !== false && !isNaN(+dish.price) && +dish.price > 0;

// A dish only carries `category_id`; the slugs live on the category
// (`category_types`). `categorySlugsById` comes from the nearby-categories
// endpoint; the menu of the pub is used as a fallback in case that response
// does not cover this category. An untagged category resolves to no slugs at
// all, which is why the section rules have to cope with an empty list.
const getDishSlugs = (dish, menu, categorySlugsById) => {
  const slugs = categorySlugsById?.[dish?.category_id];
  if (slugs) return slugs;

  const menuCategory = menu?.categories?.find(
    (category) => category?.id === dish?.category_id,
  );

  return menuCategory?.category_types ?? [];
};

// The api does not send us how often a dish is ordered yet, so "popular" is
// built from what we do have: the discount, the place of the dish in the menu
// (restaurants put their best dishes first) and how close the pub is
export const scoreDish = ({ dish, pub, index }) => {
  let score = 100 - index * 4;

  score += getDiscountPercent(dish) * 3;

  // Supported as soon as the backend starts sending it
  const soldCount = +dish?.orders_count || +dish?.sales_count || 0;
  score += soldCount * 2;

  const distanceInKm = +pub?.distance / 1000;
  if (!isNaN(distanceInKm)) score -= distanceInKm * 3;

  // A dish with a photo is much easier to order from a grid
  if (dish?.image_file_name) score += 15;

  return score;
};

const byOpenPubFirst = (a, b) => {
  const aIsOpen = a.pub?.isOpen !== false;
  const bIsOpen = b.pub?.isOpen !== false;

  if (aIsOpen === bIsOpen) return 0;

  return aIsOpen ? -1 : 1;
};

const getPubDishes = (
  menu,
  { filter, sectionId, categorySlug, categorySlugsById, maxPerPub },
) => {
  const pub = menu?.pub;

  return (menu?.dishes || [])
    .filter(isOrderableDish)
    .filter((dish) => filter !== topDishesFilters.deals || hasDiscount(dish))
    .filter((dish) => {
      const slugs = getDishSlugs(dish, menu, categorySlugsById);

      if (!slugsMatchSection(slugs, sectionId)) return false;

      return !categorySlug || slugs.includes(categorySlug);
    })
    .map((dish, index) => ({
      key: `${pub?.id}-${dish?.id}`,
      dish,
      pub,
      score: scoreDish({ dish, pub, index }),
      discountPercent: getDiscountPercent(dish),
      distance: +pub?.distance || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPerPub);
};

// Builds one feed of dishes out of the menus of all the pubs nearby
export const buildTopDishes = (
  pubsWithMenus = [],
  {
    filter = topDishesFilters.top,
    limit = 40,
    sectionId = null,
    categorySlug = "",
    categorySlugsById = {},
  } = {},
) => {
  const maxPerPub = categorySlug
    ? MAX_DISHES_PER_PUB_IN_CATEGORY
    : MAX_DISHES_PER_PUB;

  const dishesByPub = pubsWithMenus
    .map((menu) =>
      getPubDishes(menu, {
        filter,
        sectionId,
        categorySlug,
        categorySlugsById,
        maxPerPub,
      }),
    )
    .filter((pubDishes) => pubDishes.length > 0)
    .sort((a, b) => b[0].score - a[0].score);

  // Take the best dish of every pub, then the second best of every pub and so
  // on, so that the feed does not start with five dishes of one restaurant
  const feed = [];
  for (let place = 0; place < maxPerPub; place++) {
    for (const pubDishes of dishesByPub) {
      if (pubDishes[place]) feed.push(pubDishes[place]);
    }
  }

  if (filter === topDishesFilters.deals) {
    feed.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  if (filter === topDishesFilters.near) {
    feed.sort((a, b) => a.distance - b.distance);
  }

  // Closed pubs are still shown, but always at the end of the feed
  feed.sort(byOpenPubFirst);

  return feed.slice(0, limit);
};
