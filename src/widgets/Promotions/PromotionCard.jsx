import { Text, View } from "native-base";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { Animated } from "react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import {
  getPromotionBadge,
  getPromotionSubtitle,
  getPromotionTitle,
} from "../../shared/utils/promotions";

const getImagePath = (promotion) => {
  if (promotion?.image_file_name) {
    return (
      ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/promotions/" +
      promotion.image_file_name
    );
  }

  //Fallback to the dish image of the promotion
  if (promotion?.dish_image_file_name) {
    return (
      ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/dishes/" +
      promotion.dish_image_file_name
    );
  }

  //And then to the background of the pub
  if (promotion?.pub_bg_image_file_name) {
    return (
      ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/pubs/bgs/" +
      promotion.pub_bg_image_file_name
    );
  }

  return null;
};

const PromotionCard = ({ promotion, isViewable }) => {
  const { t } = useTranslation();

  const imagePath = getImagePath(promotion);

  const title = getPromotionTitle(t, promotion);
  const subtitle = getPromotionSubtitle(t, promotion);
  const badge = getPromotionBadge(promotion);

  const scaleAnimation = useRef(new Animated.Value(0)).current;

  // Animate the image when it becomes visible
  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: isViewable ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isViewable]);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imagePath) setImageLoaded(true);
  }, [imagePath]);

  return (
    <View style={{ width: 300 }}>
      {/* Image container */}
      <Animated.View
        style={{
          height: scaleAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [140, 160],
          }),
          overflow: "hidden",
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111",
        }}
      >
        {imagePath ? (
          <Image
            onLoad={() => setImageLoaded(true)}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            source={{ uri: imagePath }}
            alt=""
          />
        ) : (
          <View w="full" h="full" alignItems="center" justifyContent="center">
            <Image
              contentFit="contain"
              style={{ width: 60, height: 60 }}
              source={images.Sales}
              alt=""
            />
          </View>
        )}

        {/* Darken the image so that the promotion text stays readable */}
        <View
          position="absolute"
          w="full"
          h="full"
          backgroundColor="rgba(0, 0, 0, 0.45)"
          justifyContent="flex-end"
          px="4"
          py="3"
        >
          <Text color="#fff" fontSize={18} fontWeight="bold" numberOfLines={2}>
            {title}
          </Text>
          {!!subtitle && (
            <Text color="#eee" fontSize={12} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Discount badge */}
        {!!badge && (
          <View
            position="absolute"
            top={3}
            left={3}
            px="3"
            py="1"
            rounded="2xl"
            backgroundColor="emerald.600"
          >
            <Text color="#fff" fontSize={14} fontWeight="bold">
              {badge}
            </Text>
          </View>
        )}

        {/* Pub is closed right now */}
        {promotion?.pub_is_open === false && (
          <View
            position="absolute"
            top={3}
            right={3}
            px="3"
            py="1"
            rounded="2xl"
            backgroundColor="rgba(0, 0, 0, 0.7)"
          >
            <Text color="#fff" fontSize={12}>
              {t("promotions.pub_is_closed")}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Info container */}
      <View
        style={{
          paddingTop: 3,
          paddingRight: 20,
          paddingLeft: 20,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontSize: 14, marginRight: 5 }}
        >
          {promotion?.pub_name}
        </Text>

        {!isNaN(+promotion?.distance) && (
          <View alignItems="center" flexDir="row" gap={1}>
            <View style={{ width: 15, height: 15 }}>
              <Image
                source={images.Locaiton}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {(+promotion?.distance / 1000).toFixed(1)} km
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(PromotionCard);
