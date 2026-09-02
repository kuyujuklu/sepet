import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  pubsApi,
  useGetNearbyPubsQuery,
  useGetTopDishesQuery,
} from "../../shared/api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { searchDishes } from "../../shared/utils/topDishes";

// Only search still loads menus pub by pub (see below), so this cap is no
// longer about the feed - a client typing a dish name expects it found
// anywhere nearby.
export const MAX_PUBS_FOR_SEARCH = 30;

// One page of the feed. The server caps a request at 100.
export const FEED_PAGE_SIZE = 40;

// The feed of dishes for the current point.
//
// The curated feed is one request: GET /api/client/get-available-top-dishes
// ranks (hits, then orders_count, then place), interleaves so one pub cannot
// fill the screen, sinks closed pubs and pages - all the things the client
// used to do itself over eight parallel full-menu responses.
//
// Search is the one thing left on the client: the feed endpoint has no `?q=`,
// so while the search input is open (and only then) the menus of up to
// MAX_PUBS_FOR_SEARCH pubs are still fetched and matched by name here.
export const useTopDishes = ({
  filter,
  limit = FEED_PAGE_SIZE,
  sectionId,
  categorySlug,
  searchQuery = "",
  // The pubs view shows no dishes at all - no reason to load a feed
  skip = false,
} = {}) => {
  const dispatch = useDispatch();
  const location = useSelector(selectGeolocation);

  const isSearching = !!searchQuery.trim();

  const [offset, setOffset] = useState(0);

  // A new filter/category/section is a different feed, not more of this one
  useEffect(() => {
    setOffset(0);
  }, [filter, categorySlug, sectionId, location?.lat, location?.lng]);

  const {
    data: feedData,
    isLoading: feedIsLoading,
    isFetching: feedIsFetching,
    error: feedError,
    refetch: refetchFeed,
  } = useGetTopDishesQuery(
    {
      coords: { lat: location?.lat, lng: location?.lng },
      filter,
      categorySlug,
      section: sectionId,
      limit,
      offset,
    },
    {
      skip: skip || isSearching || !location,
      // A pub's isOpen flag is only ever recomputed on an actual fetch (see
      // getPubWorkHours in pubsApi's transformResponse) - without this, a pub
      // that opens mid-session stays "closed" on screen until the client
      // leaves and comes back. Refetch if what's cached is stale on mount,
      // and keep it fresh every few minutes while the feed is open.
      refetchOnMountOrArgChange: 60,
      pollingInterval: 180000,
    },
  );

  // Still needed while searching (which pubs to load menus from) and by the
  // callers that show "there is nothing here at all" vs "nothing matched"
  const {
    data: pubsData,
    isLoading: pubsAreLoading,
    isFetching: pubsAreFetching,
    refetch: refetchPubs,
  } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng }, section: sectionId },
    { skip: !location, refetchOnMountOrArgChange: 60, pollingInterval: 180000 },
  );

  const searchPubs = useMemo(() => {
    if (!isSearching || !pubsData?.pubs) return [];

    const pubs = [...pubsData.pubs];

    pubs.sort((a, b) => a.distance - b.distance);
    pubs.sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));

    return pubs.slice(0, MAX_PUBS_FOR_SEARCH);
  }, [pubsData, isSearching]);

  const searchPubsKey = searchPubs.map((pub) => pub.id).join(",");

  const [menus, setMenus] = useState([]);
  const [menusAreLoading, setMenusAreLoading] = useState(false);

  // Set by refetch() right before it bumps refreshIndex, read (and cleared)
  // by the effect below - a pull-to-refresh forces past the cache, an
  // ordinary re-run still reuses it like before.
  const forceRefetchRef = useRef(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (skip || !isSearching) return;

    if (searchPubs.length === 0) {
      setMenus([]);
      return;
    }

    let isActual = true;
    setMenusAreLoading(true);

    const forceRefetch = forceRefetchRef.current;
    forceRefetchRef.current = false;

    const coords = location ? { lat: location.lat, lng: location.lng } : undefined;

    const requests = searchPubs.map((pub) =>
      dispatch(
        pubsApi.endpoints.getPubInfo.initiate(
          { pubID: pub.id, coords },
          { forceRefetch },
        ),
      ),
    );

    Promise.all(
      // One unreachable pub should not empty the whole result
      requests.map((request) => request.unwrap().catch(() => null)),
    ).then((responses) => {
      if (!isActual) return;

      const loadedMenus = responses
        .map((response, index) => {
          if (!response?.dishes) return null;

          const nearbyPub = searchPubs[index];

          return {
            pub: {
              ...response.pub,
              distance: response.pub?.distance ?? nearbyPub?.distance,
              isOpen: response.pub?.isOpen ?? nearbyPub?.isOpen,
            },
            dishes: response.dishes,
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
  }, [searchPubsKey, skip, isSearching, refreshIndex]);

  // Pull-to-refresh: re-ask for the first page of the feed and, while search
  // is open, force past the per-pub menu cache too, so a stale
  // discount/price does not survive a refresh
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const refetch = useCallback(() => {
    forceRefetchRef.current = true;
    setIsPullRefreshing(true);
    refetchPubs();

    // Dropping back to the first page is itself a fetch (offset is part of
    // the query args); only ask for one explicitly when we are already there
    if (offset === 0) refetchFeed();
    else setOffset(0);

    setRefreshIndex((index) => index + 1);
  }, [refetchPubs, refetchFeed, offset]);

  // The pull spinner should only ever show for an explicit pull, never for
  // the silent background poll above (that one also flips isFetching) - so
  // it's tracked separately and just cleared once whatever the pull kicked
  // off has settled, instead of reading isFetching directly.
  useEffect(() => {
    if (!isPullRefreshing) return;

    const stillFetching = isSearching
      ? pubsAreFetching || menusAreLoading
      : feedIsFetching || pubsAreFetching;

    if (!stillFetching) setIsPullRefreshing(false);
  }, [isPullRefreshing, isSearching, pubsAreFetching, feedIsFetching, menusAreLoading]);

  // The feed arrives as flat dish objects with a `pub` on each; the cards
  // expect the { key, dish, pub } shape the client used to build itself
  const feedDishes = useMemo(
    () =>
      (feedData?.dishes ?? []).map((dish) => ({
        key: `${dish.pub?.id}-${dish.id}`,
        dish,
        pub: dish.pub,
      })),
    [feedData],
  );

  const searchResults = useMemo(
    () =>
      isSearching
        ? searchDishes(menus, { query: searchQuery, sectionId, limit })
        : [],
    [isSearching, menus, searchQuery, sectionId, limit],
  );

  const dishes = isSearching ? searchResults : feedDishes;

  const total = feedData?.total ?? 0;
  const hasMore = !isSearching && feedDishes.length < total;

  const loadMore = useCallback(() => {
    if (isSearching || feedIsFetching) return;
    if (feedDishes.length >= total) return;

    setOffset(feedDishes.length);
  }, [isSearching, feedIsFetching, feedDishes.length, total]);

  return {
    dishes,
    pubs: pubsData?.pubs ?? [],
    error: feedError,
    hasPubs: !!pubsData?.pubs && pubsData.pubs.length > 0,
    isSearching,
    hasMore,
    loadMore,
    refetch,
    isLoading: isSearching
      ? pubsAreLoading || (menusAreLoading && dishes.length === 0)
      : feedIsLoading || (feedIsFetching && dishes.length === 0),
    // Distinct from isLoading: true for a pull-to-refresh, even once the
    // feed already has cards on screen and the skeleton is long gone. Tied to
    // the explicit pull only (see isPullRefreshing above) rather than raw
    // isFetching, so the silent background poll never pops this spinner open
    // on its own - a "load more" is deliberately not a refresh either, that
    // spinner belongs at the bottom of the list, not over the whole thing.
    isRefreshing: isPullRefreshing,
    isLoadingMore: !isSearching && feedIsFetching && offset > 0,
  };
};
