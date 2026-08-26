import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pubsApi, useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { buildTopDishes } from "../../shared/utils/topDishes";
import { useNearbyCategoryNames } from "../../shared/hooks/useNearbyCategoryNames";

// Every menu is a separate request, so we only load the closest pubs
const MAX_PUBS_TO_LOAD = 8;

// Collects the menus of the pubs nearby and turns them into one feed
// of the most interesting dishes
export const useTopDishes = ({
  filter,
  limit,
  sectionId,
  categorySlug,
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
    error: pubsError,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    {
      skip: skip || !location,
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
    },
  );

  const nearbyPubs = useMemo(() => {
    if (!pubsData?.pubs) return [];

    const pubs = [...pubsData.pubs];

    pubs.sort((a, b) => a.distance - b.distance);
    pubs.sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));

    return pubs.slice(0, MAX_PUBS_TO_LOAD);
  }, [pubsData]);

  const nearbyPubsKey = nearbyPubs.map((pub) => pub.id).join(",");

  const [menus, setMenus] = useState([]);
  const [menusAreLoading, setMenusAreLoading] = useState(false);

  useEffect(() => {
    if (skip) return;

    if (nearbyPubs.length === 0) {
      setMenus([]);
      return;
    }

    let isActual = true;
    setMenusAreLoading(true);

    const requests = nearbyPubs.map((pub) =>
      dispatch(pubsApi.endpoints.getPubInfo.initiate({ pubID: pub.id })),
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
  }, [nearbyPubsKey, skip]);

  const dishes = useMemo(
    () =>
      buildTopDishes(menus, {
        filter,
        limit,
        sectionId,
        categorySlug,
        categorySlugsById,
      }),
    [menus, filter, limit, sectionId, categorySlug, categorySlugsById],
  );

  return {
    dishes,
    pubs: nearbyPubs,
    error: pubsError,
    hasPubs: !!pubsData?.pubs && pubsData.pubs.length > 0,
    isLoading: pubsAreLoading || (menusAreLoading && dishes.length === 0),
  };
};
