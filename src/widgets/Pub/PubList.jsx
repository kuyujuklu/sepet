import { FlatList, View } from "react-native";
import Pub from "./Pub";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import newDebounce from "../../shared/utils/debounce";
import { Pressable } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";

const viewabilityConfig = {
  waitForInteraction: true,
  viewAreaCoveragePercentThreshold: 60,
};

const PubList = ({ selectedPub, selectPub }) => {
  const navigator = useNavigation();

  const [viewable, setViewable] = useState(0);

  const flatListRef = useRef(null);

  const location = useSelector(selectGeolocation);

  const {
    data: pubsData,
    isLoading: pubsIsLoading,
    error: pubsError,
  } = useGetNearbyPubsQuery(
    {
      coords: { lat: location.lat, lng: location.lng },
    },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );
  useEffect(() => {
    if (!pubsData) return;

    console.log(pubsData?.pubs);
  }, [pubsData]);

  const sortedPubs = useMemo(() => {
    if (!pubsData || !pubsData?.pubs) return [];

    const pubs = [...pubsData.pubs];
    //.filter((pub) => pub.isOpen);

    pubs.sort((a, b) => a.distance - b.distance);
    pubs.sort((a, b) => (a.isOpen === b.isOpen ? 0 : a.isOpen ? -1 : 1));

    return pubs;
  }, [pubsData]);

  useEffect(() => {
    if (!sortedPubs || sortedPubs.length === 0) return;
    selectPub(sortedPubs[0].id);
  }, [sortedPubs]);

  // Log error on getting error from api
  useEffect(() => {}, [pubsError]);

  // Scroll flatlist on changing selected pub
  useEffect(() => {
    scrollPubListToActiveIndex();
  }, [selectedPub]);

  const scrollPubListToActiveIndex = useCallback(() => {
    if (!selectedPub || !sortedPubs) return;

    const pubIndex = sortedPubs?.findIndex((pub) => pub.id === selectedPub);
    if (pubIndex === -1) return;

    console.log("Scrolling to pubIndex: ", pubIndex);
    setViewable(pubIndex);

    flatListRef.current.scrollToIndex({
      index: pubIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [selectedPub, sortedPubs]);

  const handlePubPress = (id) => {
    if (!id) return;

    if (!sortedPubs || sortedPubs.length === 0) return;

    if (sortedPubs.length <= viewable) return;

    if (sortedPubs[viewable]?.id !== id) {
      selectPub(id);
      return;
    }

    navigator.navigate("PubInfo", { pubID: id });
  };

  const handleViewableItemsChange = ({ viewableItems }) => {
    const viewables = viewableItems.map((item) => item.index);
    let currentPub = null;
    let viewable = 0;

    if (viewables.length > 0) {
      viewable = viewables[0];
      try {
        currentPub = sortedPubs[viewables[0]];
      } catch (e) {
        return;
      }
    }

    if (currentPub && currentPub.id !== selectedPub) {
      selectPub(currentPub.id);
    }

    setViewable(viewable);
  };

  const debounceHandleViewableItemsChange = newDebounce(
    handleViewableItemsChange,
    300,
  );

  return (
    <SafeAreaView style={{ paddingLeft: 10 }} edges={[]}>
      <FlatList
        ref={flatListRef}
        renderItem={({ item, index }) => (
          <Pressable
            // id={index}
            disabled={!item.isOpen}
            onPress={() => {
              handlePubPress(item?.id);
            }}
          >
            <Pub
              isViewable={index === viewable}
              pub={item}
              distance={item.distance}
            />
          </Pressable>
        )}
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 250));
          console.log("Scroll failed");
          wait.then(() => {
            scrollPubListToActiveIndex();
          });
        }}
        viewabilityConfig={viewabilityConfig}
        data={sortedPubs}
        horizontal
        onViewableItemsChanged={debounceHandleViewableItemsChange}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </SafeAreaView>
  );
};

export default memo(PubList);
