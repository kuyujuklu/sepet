import { categories } from "../../app/static-data/data";
import { images } from "../../app/images/images";

// The food-category taxonomy of the client: which slugs we know how to show,
// which icon each one gets and how they are ordered in the carousel.
// Lives here rather than inside the carousel widget because the pages and the
// dish feed need it too.

export const placeholderAllCategory = {
  image: images.AllFoodHighQuality,
  value: "",
};

export const placeholderCategories = {
  [categories.Sales]: {
    image: images.Sales,
    value: categories.Sales,
    priority: 1,
  },
  [categories.Asian]: {
    image: images.Sushi,
    value: categories.Asian,
  },
  [categories.Flowers]: {
    image: images.Flowers,
    value: categories.Flowers,
  },
  [categories.FastFood]: {
    image: images.FastFood,
    value: categories.FastFood,
  },
  [categories.Breakfast]: {
    image: images.Breakfast,
    value: categories.Breakfast,
  },
  [categories.Grill]: {
    image: images.Grill,
    value: categories.Grill,
  },
  [categories.Dessert]: {
    image: images.Cupcake,
    value: categories.Dessert,
  },
  [categories.Pasta]: {
    image: images.Spaghetti,
    value: categories.Pasta,
  },
  [categories.Soup]: {
    image: images.Soup,
    value: categories.Soup,
  },
  [categories.Alcohol]: {
    image: images.Alcohol,
    value: categories.Alcohol,
  },
  [categories.EastFood]: {
    image: images.EastFood,
    value: categories.EastFood,
  },
  [categories.Flour]: {
    image: images.Flour,
    value: categories.Flour,
  },
  [categories.HomeFood]: {
    image: images.HomeFood,
    value: categories.HomeFood,
  },
  [categories.Meat]: {
    image: images.Meat,
    value: categories.Meat,
  },
  [categories.Kebab]: {
    image: images.Kebab,
    value: categories.Kebab,
  },
  [categories.Salad]: {
    image: images.Salad,
    value: categories.Salad,
  },
  [categories.Snacks]: {
    image: images.Snacks,
    value: categories.Snacks,
  },
};

export const categoryNamesArray = Object.keys(placeholderCategories);

// The icon of a category chip; the empty slug is the "all" chip
export const getCategoryImage = (slug) =>
  slug ? placeholderCategories[slug]?.image : placeholderAllCategory.image;

// Short caption for the carousel chip. The "all" chip has its own short key -
// "Все заведения" is a page title, not a caption under an icon.
export const getCategoryCaptionKey = (slug) =>
  slug ? getCategoryTranslationKey(slug) : "categories.all";

// Full name, used as the title of the categories page
export const getCategoryTranslationKey = (slug) => {
  if (slug && placeholderCategories[slug]) return `categories.${slug}`;

  return "categories.all_publishments";
};

// Copies before sorting: the caller usually passes a memoized array and
// sorting it in place made the carousel order jump between renders
export const sortCategoryNames = (names = []) =>
  [...names].sort((x, y) => {
    const a = placeholderCategories[x];
    const b = placeholderCategories[y];

    if (a?.priority && b?.priority) return a.priority - b.priority;
    if (a?.priority) return -1;
    if (b?.priority) return 1;

    // Tie-break on the slug so the order is stable between renders
    return String(x).localeCompare(String(y));
  });
