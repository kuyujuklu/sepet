import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetCitiesQuery } from "../api/geo/geoApi";
import { getCityName } from "../utils/geo";

// The cities we deliver in, ordered by `place`, with their names already in
// the current language. Replaces the hardcoded table in
// `shared/utils/cities.js`, so adding a city is a server change now.
export const useCities = () => {
  const { i18n } = useTranslation();
  const { data, isLoading } = useGetCitiesQuery();

  return useMemo(() => {
    const cities = [...(data?.cities ?? [])].sort(
      (a, b) => (a?.place ?? 0) - (b?.place ?? 0),
    );

    return {
      cities,
      isLoading,
      getName: (city) => getCityName(city, i18n.language),
    };
  }, [data, isLoading, i18n.language]);
};
