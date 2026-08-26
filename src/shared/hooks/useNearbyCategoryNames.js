import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetNearbyCategoriesQuery } from "../api/categories/categoriesApi";
import { useGetNearbyPubsQuery } from "../api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { placeholderCategories } from "../utils/foodCategories";

// Which category slugs can actually be shown for the current address, plus the
// slugs of every nearby category by its id (the dish feed joins on that).
// Both queries are shared RTK Query cache entries, so calling this hook from
// several screens at once costs nothing extra.
export const useNearbyCategoryNames = () => {
  const location = useSelector(selectGeolocation);

  const { data: nearCategoriesData } = useGetNearbyCategoriesQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const { data: nearPubsData } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  return useMemo(() => {
    const empty = { possibleCategoryNames: [], categorySlugsById: {} };

    if (!nearCategoriesData?.categories) return empty;
    if (!nearPubsData?.pubs) return empty;

    const categoryNamesSet = new Set();
    const categoriesWithNotValidPubs = new Set();
    const categorySlugsById = {};

    nearCategoriesData.categories.forEach((category) => {
      if (!category?.category_types) return;
      if (!category?.visible) return;

      categorySlugsById[category.id] = category.category_types;

      if (categoriesWithNotValidPubs.has(category.pub_id)) return;

      const pub = nearPubsData.pubs.find((pub) => pub.id === category.pub_id);

      if (!pub) {
        categoriesWithNotValidPubs.add(category.pub_id);
        return;
      }

      for (const type of category.category_types) {
        if (placeholderCategories[type]) categoryNamesSet.add(type);
      }
    });

    return {
      possibleCategoryNames: Array.from(categoryNamesSet),
      categorySlugsById,
    };
  }, [nearCategoriesData, nearPubsData]);
};
