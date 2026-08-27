import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetNearbyCategoriesQuery } from "../api/categories/categoriesApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useCategoryTypes } from "./useCategoryTypes";

// Which category slugs can actually be shown for the current address and the
// current section.
//
// The section filter is now a query parameter: `?section=` makes the server
// return only the categories of pubs in that section (the service type is the
// pub's field), and those categories only ever belong to pubs that deliver to
// the point - so the client-side cross-check against the nearby-pubs list is
// gone, and so is the `categorySlugsById` map the dish feed used to join on
// (a dish carries its own `category_types` now).
//
// A slug that the dictionary does not know is dropped: it has no name and no
// icon, so a chip for it would be blank.
export const useNearbyCategoryNames = (sectionId) => {
  const location = useSelector(selectGeolocation);

  const { categoryTypesBySlug } = useCategoryTypes();

  const { data: nearCategoriesData } = useGetNearbyCategoriesQuery(
    { coords: { lat: location?.lat, lng: location?.lng }, section: sectionId },
    { skip: !location },
  );

  return useMemo(() => {
    const categoryNamesSet = new Set();

    (nearCategoriesData?.categories ?? []).forEach((category) => {
      if (!category?.visible) return;

      for (const slug of category.category_types ?? []) {
        if (categoryTypesBySlug[slug]) categoryNamesSet.add(slug);
      }
    });

    return { possibleCategoryNames: Array.from(categoryNamesSet) };
  }, [nearCategoriesData, categoryTypesBySlug]);
};
