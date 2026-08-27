import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetCategoryTypesQuery } from "../api/dictionaries/dictionariesApi";

// The category-type dictionary, localized.
//
// It used to be `placeholderCategories` plus a `categories.*` block in three
// locale files, which meant a category type added on the server was invisible
// until the next store release. Now the names travel with the data:
// `name_ru` / `name_ro` / `name_gz` per type, `priority` for the carousel
// order (lower first), `service_type` for which section it belongs to.
//
// One shared RTK Query cache entry, so calling this from several screens at
// once costs a single request.

const nameFieldByLanguage = {
  ru: "name_ru",
  ro: "name_ro",
  gz: "name_gz",
};

export const getCategoryTypeName = (categoryType, language) => {
  if (!categoryType) return "";

  const field = nameFieldByLanguage[language] ?? nameFieldByLanguage.ru;

  // ru is the fallback language of the app; an untranslated type still has a
  // name rather than an empty chip
  return categoryType[field] || categoryType.name_ru || categoryType.slug;
};

export const useCategoryTypes = ({ serviceType } = {}) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const { data, isLoading } = useGetCategoryTypesQuery({ serviceType });

  return useMemo(() => {
    const categoryTypes = data?.category_types ?? [];

    const bySlug = {};
    categoryTypes.forEach((categoryType) => {
      bySlug[categoryType.slug] = categoryType;
    });

    return {
      categoryTypes,
      categoryTypesBySlug: bySlug,
      isLoading,
      // Name of one slug, in the current language
      getName: (slug) => getCategoryTypeName(bySlug[slug], language),
      // Copies before sorting: the caller usually passes a memoized array and
      // sorting it in place made the carousel order jump between renders
      sortSlugs: (slugs = []) =>
        [...slugs].sort((x, y) => {
          const a = bySlug[x];
          const b = bySlug[y];

          const priorityA = a?.priority ?? Number.MAX_SAFE_INTEGER;
          const priorityB = b?.priority ?? Number.MAX_SAFE_INTEGER;

          if (priorityA !== priorityB) return priorityA - priorityB;

          // Tie-break on the localized name so the order is stable between
          // renders and reads alphabetically inside a priority group
          return getCategoryTypeName(a, language).localeCompare(
            getCategoryTypeName(b, language),
          );
        }),
    };
  }, [data, isLoading, language]);
};
