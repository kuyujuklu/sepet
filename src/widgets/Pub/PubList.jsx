import {
  FlatList,
  View,
} from "react-native";
import Pub from "./Pub";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { useEffect, useRef, useState } from "react";
import newDebounce from "../../shared/utils/debounce";
import { Pressable } from "native-base";
import { useNavigation } from "@react-navigation/native";

const viewabilityConfig = {
  waitForInteraction: true,
  viewAreaCoveragePercentThreshold: 60,
};

const PubList = ({ selectedPub, selectPub }) => {
  const navigator = useNavigation()

  const [viewable, setViewable] = useState(0);

  const flatListRef = useRef(null);

  const defaultCenter = {
    lat: 46.00556,
    lng: 28.8575,
  };

  const {
    data: pubsData,
    isLoading: pubsIsLoading,
    error: pubsError,
  } = useGetNearbyPubsQuery({
    coords: { lat: defaultCenter.lat, lng: defaultCenter.lng },
  });

  // Log error on getting error from api
  useEffect(() => {
    if (pubsError) {
      console.log("loading nearby pubs error: ", pubsError);
    }
  }, [pubsError]);

  // Scroll flatlist on changing selected pub
  useEffect(() => {
    if (!selectedPub) return;
    const pubIndex = pubsData?.pubs?.findIndex((pub) => pub.id === selectedPub);
    if (pubIndex === -1) return;

    setViewable(pubIndex);

    flatListRef.current.scrollToIndex({
      index: pubIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [selectedPub]);

  const handlePubPress = (id) => {
    if(!id) return;

    if(pubsData?.pubs.length === 0) return;

    if(pubsData?.pubs.length <= viewable) return;

    if(pubsData?.pubs[viewable]?.id !== id) {
      selectPub(id);
      return;
    }

    navigator.navigate("PubInfo", { pubID: id })
  }

  const handleViewableItemsChange = ({ viewableItems }) => {
    const viewables = viewableItems.map((item) => item.index);
    let currentPub = null;
    let viewable = 0;

    if (viewables.length > 0) {
      viewable = viewables[0];
      try {
        currentPub = pubsData?.pubs[viewables[0]];
      } catch (e) {
        console.log("pub is not in list: ", e);
      }
    }

    if (currentPub && currentPub.id !== selectedPub) {
      selectPub(currentPub.id);
    }

    setViewable(viewable);
  };

  const debounceHandleViewableItemsChange = newDebounce(handleViewableItemsChange, 300)

  return (
    <SafeAreaView style={{ paddingLeft: 10}} edges={[]} >
      <FlatList
        ref={flatListRef}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => {handlePubPress(item?.id)}} >
            <Pub isViewable={index === viewable} pub={item} />
          </Pressable>
        )}
        viewabilityConfig={viewabilityConfig}
        data={pubsData?.pubs}
        horizontal
        onViewableItemsChanged={debounceHandleViewableItemsChange}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </SafeAreaView>
  );
};

export default PubList;
