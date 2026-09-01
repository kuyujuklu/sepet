import { images } from "../../app/images/images";

// The icons of the category types.
//
// The taxonomy itself - which slugs exist, what they are called in ru/ro/gz
// and in which order they appear - now comes from GET /api/client/category-types
// (see shared/hooks/useCategoryTypes). Only the pictures stayed here: the
// server has no icon set for them and `icon_file_name` is always empty.
//
// A slug with no entry here simply gets the neutral "all" icon, so a category
// type added on the server shows up in the carousel on the next launch
// instead of waiting for a store release.

export const placeholderAllCategory = {
  image: images.AllFoodHighQuality,
  value: "",
};

export const categoryIcons = {
  sales: images.Sales,
  asian: images.Sushi,
  flowers: images.Flowers,
  fast_food: images.FastFood,
  breakfast: images.Breakfast,
  grill: images.Grill,
  dessert: images.Cupcake,
  pasta: images.Spaghetti,
  soup: images.Soup,
  alcohol: images.Alcohol,
  east_food: images.EastFood,
  flour: images.Flour,
  home_food: images.HomeFood,
  meat: images.Meat,
  kebab: images.Kebab,
  salad: images.Salad,
  snacks: images.Snacks,
  groceries: images.Cart,
};

// The icon of a category chip; the empty slug is the "all" chip
export const getCategoryImage = (slug) =>
  (slug ? categoryIcons[slug] : null) ?? placeholderAllCategory.image;
