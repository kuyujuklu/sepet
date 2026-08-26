import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text } from "native-base";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import PromotionCard from "./PromotionCard";
import newDebounce from "../../shared/utils/debounce";
import { images } from "../../app/images/images";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import { useGetNearbyPromotionsQuery } from "../../shared/api/promotions/promotionsApi";

const viewabilityConfig = {
  waitForInteraction: true,
  viewAreaCoveragePercentThreshold: 60,
};

const PubPromotions = ({ selectedPub, selectPub }) => {
  const { t } = useTranslation();
  const navigator = useNavigation();

  const [viewable, setViewable] = useState(0);

  const flatListRef = useRef(null);

  const location = useSelector(selectGeolocation);

  const {
    data: promotionsData,
    isLoading: promotionsIsLoading,
    error: promotionsError,
  } = useGetNearbyPromotionsQuery(
    {
      coords: { lat: location?.lat, lng: location?.lng },
    },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const { data: pubsData } = useGetNearbyPubsQuery(
    {
      coords: { lat: location?.lat, lng: location?.lng },
    },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  // Log error on getting promotions error from api
  useEffect(() => { }, [promotionsError]);

  // Take only the promotions of the pubs that can deliver to the client
  // and add the pub info to them (name, distance, work state, image)
  const promotions = useMemo(() => {
    if (!promotionsData?.promotions) return [];
    if (!pubsData?.pubs) return [];

    const promotions = [];

    for (const promotion of promotionsData.promotions) {
      const pub = pubsData.pubs.find((pub) => pub.id === promotion.pub_id);

      if (!pub) continue;

      promotions.push({
        ...promotion,
        pub_name: promotion.pub_name ?? pub.name,
        pub_bg_image_file_name:
          promotion.pub_bg_image_file_name ?? pub.bg_image_file_name,
        pub_is_open: pub.isOpen,
        currency_id: promotion.currency_id ?? pub.currency_id,
        distance: pub.distance,
      });
    }

    //Opened pubs first, then the closest ones
    promotions.sort((a, b) => a.distance - b.distance);
    promotions.sort((a, b) =>
      a.pub_is_open === b.pub_is_open ? 0 : a.pub_is_open ? -1 : 1,
    );

    return promotions;
  }, [promotionsData, pubsData]);

  const scrollToSelectedPubPromotion = useCallback(() => {
    if (!selectedPub || promotions.length === 0) return;

    const promotionIndex = promotions.findIndex(
      (promotion) => promotion.pub_id === selectedPub,
    );
    if (promotionIndex === -1) return;

    if (!flatListRef || !flatListRef.current) return;

    setViewable(promotionIndex);

    flatListRef.current.scrollToIndex({
      index: promotionIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [selectedPub, promotions]);

  // Scroll flatlist to the promotions of the pub selected in the pub list
  useEffect(() => {
    scrollToSelectedPubPromotion();
  }, [selectedPub, promotions]);

  const handlePromotionPress = (promotion) => {
    if (!promotion?.pub_id) return;

    //First press syncs the pub list with the promotion,
    //the second one opens the pub
    if (promotion.pub_id !== selectedPub) {
      selectPub(promotion.pub_id);
      return;
    }

    navigator.navigate("PubInfo", { pubID: promotion.pub_id });
  };

  const handleViewableItemsChange = ({ viewableItems }) => {
    if (viewableItems.length === 0) return;

    const viewable = viewableItems[0].index ?? 0;
    const currentPromotion = promotions[viewable];

    if (currentPromotion && currentPromotion.pub_id !== selectedPub) {
      selectPub(currentPromotion.pub_id);
    }

    setViewable(viewable);
  };

  const debounceHandleViewableItemsChange = newDebounce(
    handleViewableItemsChange,
    500,
  );

  if (promotionsIsLoading) {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Spinner />
      </View>
    );
  }

  //Nothing to show - no promotions nearby or the api is not available
  if (promotions.length === 0) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 20,
          gap: 10,
        }}
      >
        <Image
          source={images.Sales}
          contentFit="contain"
          style={{ width: 50, height: 50, opacity: 0.5 }}
          alt=""
        />
        <Text textAlign="center" color="coolGray.500" fontSize={14}>
          {t("promotions.no_promotions")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ paddingLeft: 10 }} edges={[]}>
      <FlatList
        ref={flatListRef}
        data={promotions}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handlePromotionPress(item)}>
            <PromotionCard promotion={item} isViewable={index === viewable} />
          </TouchableOpacity>
        )}
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 250));
          wait.then(() => {
            scrollToSelectedPubPromotion();
          });
        }}
        viewabilityConfig={viewabilityConfig}
        horizontal
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={debounceHandleViewableItemsChange}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </SafeAreaView>
  );
};

export default memo(PubPromotions);
