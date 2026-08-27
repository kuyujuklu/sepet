import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pubsApi, useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { buildTopDishes, searchDishes } from "../../shared/utils/topDishes";
import { useNearbyCategoryNames } from "../../shared/hooks/useNearbyCategoryNames";

// Every menu is a separate request, so we only load the closest pubs - for
// the curated feed. Search widens this on demand (see maxPubs below): a
// client typing a dish name expects it found anywhere nearby, not just
// among the 8 pubs the Хиты feed happens to already have loaded.
export const MAX_PUBS_TO_LOAD = 8;
export const MAX_PUBS_FOR_SEARCH = 30;

// Collects the menus of the pubs nearby and turns them into one feed - either
// the curated "top dishes" feed, or (when searchQuery is set) every dish
// whose name matches, from every one of the (wider) maxPubs pubs loaded.
export const useTopDishes = ({
  filter,
  limit,
  sectionId,
  categorySlug,
  searchQuery = "",
  maxPubs = MAX_PUBS_TO_LOAD,
  // The pubs view shows no dishes at all - no reason to fetch eight menus
  skip = false,
} = {}) => {
  const dispatch = useDispatch();
  const location = useSelector(selectGeolocation);

  // Shared cache entry - the screens above already subscribe to it
  const { categorySlugsById } = useNearbyCategoryNames();

  const {
    data: pubsData,
    isLoading: pubsAreLoading,
    isFetching: pubsAreFetching,
    error: pubsError,
    refetch: refetchPubs,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: skip || !location },
  );

  const nearbyPubs = useMemo(() => {
    if (!pubsData?.pubs) return [];

    const pubs = [...pubsData.pubs];

    pubs.sort((a, b) => a.distance - b.distance);
    pubs.sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));

    return pubs.slice(0, maxPubs);
  }, [pubsData, maxPubs]);

  const nearbyPubsKey = nearbyPubs.map((pub) => pub.id).join(",");

  const [menus, setMenus] = useState([]);
  const [menusAreLoading, setMenusAreLoading] = useState(false);

  // Set by refetch() right before it bumps refreshIndex, read (and cleared)
  // by the effect below - a pull-to-refresh forces past the cache, an
  // ordinary re-run (nearby pubs changed, the pubs view got toggled off)
  // still reuses it like before.
  const forceRefetchRef = useRef(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (skip) return;

    if (nearbyPubs.length === 0) {
      setMenus([]);
      return;
    }

    let isActual = true;
    setMenusAreLoading(true);

    const forceRefetch = forceRefetchRef.current;
    forceRefetchRef.current = false;

    const requests = nearbyPubs.map((pub) =>
      dispatch(
        pubsApi.endpoints.getPubInfo.initiate(
          { pubID: pub.id },
          { forceRefetch },
        ),
      ),
    );

    Promise.all(
      // One unreachable pub should not empty the whole feed
      requests.map((request) => request.unwrap().catch(() => null)),
    ).then((responses) => {
      if (!isActual) return;

      const loadedMenus = responses
        .map((response, index) => {
          if (!response?.dishes) return null;

          const nearbyPub = nearbyPubs[index];

          return {
            pub: {
              ...response.pub,
              distance: nearbyPub?.distance,
              isOpen: response.pub?.isOpen ?? nearbyPub?.isOpen,
            },
            dishes: response.dishes,
            // Fallback for the dish -> category-slug join
            categories: response.categories,
          };
        })
        .filter(Boolean);

      setMenus(loadedMenus);
      setMenusAreLoading(false);
    });

    return () => {
      isActual = false;
      requests.forEach((request) => request.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyPubsKey, skip, refreshIndex]);

  // Pull-to-refresh: re-fetch the nearby-pubs list *and* force past the
  // per-pub menu cache, so a stale discount/price does not survive a refresh
  const refetch = useCallback(() => {
    forceRefetchRef.current = true;
    refetchPubs();
    setRefreshIndex((index) => index + 1);
  }, [refetchPubs]);

  const isSearching = !!searchQuery.trim();

  const dishes = useMemo(
    () =>
      isSearching
        ? searchDishes(menus, { query: searchQuery, sectionId, categorySlugsById, limit })
        : buildTopDishes(menus, {
            filter,
            limit,
            sectionId,
            categorySlug,
            categorySlugsById,
          }),
    [
      menus,
      isSearching,
      searchQuery,
      filter,
      limit,
      sectionId,
      categorySlug,
      categorySlugsById,
    ],
  );

  return {
    dishes,
    pubs: nearbyPubs,
    error: pubsError,
    hasPubs: !!pubsData?.pubs && pubsData.pubs.length > 0,
    isSearching,
    isLoading: pubsAreLoading || (menusAreLoading && dishes.length === 0),
    // Distinct from isLoading: true for a pull-to-refresh too, even once the
    // feed already has cards on screen and the skeleton is long gone
    isRefreshing: pubsAreFetching || menusAreLoading,
    refetch,
  };
};
