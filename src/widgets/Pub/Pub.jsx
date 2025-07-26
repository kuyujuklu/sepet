import { Animated } from "react-native";
import Stars from "./Stars";
import { Text, View } from "native-base";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import { Image } from "expo-image";
import { GetShippingTimeString } from "../../shared/utils/time";
import { useTranslation } from "react-i18next";

const Pub = ({ pub, isViewable, distance }) => {
  const { t } = useTranslation();
  const bgPath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    "/images/pubs/bgs/" +
    pub.bg_image_file_name;

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (pub && !pub.bg_image_file_name) {
      setImageLoaded(true);
    }
  }, [pub]);
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  const shippingWorkHours = {
    start: pub?.shipping?.shipping_work_start,
    end: pub?.shipping?.shipping_work_end,
  };

  const shippingTimeString = GetShippingTimeString(shippingWorkHours);

  // Animate the image when it becomes visible
  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: isViewable ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isViewable]);

  const hasFreeDeliveryPrice =
    !isNaN(+pub?.shipping_free_delivery_price) &&
    +pub?.shipping_free_delivery_price > 0;

  console.log("__________________________________RATING: ", pub?.rating)

  return (
    <View style={{ width: 300 }}>
      {/* Image container */}
      <Animated.View
        style={{
          height: scaleAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [120, 140],
          }),
          overflow: "hidden",
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!pub.isOpen && (
          <View
            bg={pub.isOpen ? "transparent" : "black"}
            w="full"
            position="absolute"
            justifyContent="center"
            alignItems="center"
            zIndex={10}
            opacity={pub.isOpen ? 1 : 0.8}
            h="full"
          >
            {!pub.isOpen && (
              <Text color="white" fontSize={18} >
                {t("home_page.pub_is_closed")}
              </Text>
            )}
            <Text color="white" fontSize={18}>
              {shippingTimeString}
            </Text>
          </View>
        )}
        {!pub.bg_image_file_name && (
          <View
            bg={"black"}
            w="full"
            position="absolute"
            justifyContent="center"
            alignItems="center"
            h="full"
          >
            <Text color="white">{pub.name}</Text>
          </View>
        )}
        <Image
          onLoad={() => setImageLoaded(true)}
          contentFit="contain"
          style={{ width: 340, aspectRatio: 1 / 8 }}
          source={{ uri: bgPath }}
          alt=""
        />
        {
          //(!isNaN(+pub?.rating) && (+pub?.rating) > 0) &&
          //<View w="full" h="full" flexDir="row" justifyContent="center" gap="1" alignItems="center" position="absolute">
          //  <View flexDir="row" justifyContent="center" gap="1" alignItems="center" px="5" py="2" borderRadius="2xl" bgColor="#00000088" >
          //    <Text color="white" fontSize="xl">{pub?.rating?.toFixed(1)}</Text>
          //    <Image
          //      contentFit="contain"
          //      style={{ width: 20, aspectRatio: 1 / 1 }}
          //      source={images.StarFilled}
          //      alt=""
          //    />
          //
          //  </View>
          //</View>
        }
      </Animated.View>

      {/* free delivery price */}
      {hasFreeDeliveryPrice && (
        <View
          style={{
            paddingRight: 20,
            paddingLeft: 20,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Text style={{ fontSize: 14 }} textAlign="center" fontWeight="bold">
            {t("pub_card.free_delivery_from")}{" "}
            {pub?.shipping_free_delivery_price} Lei
          </Text>
        </View>
      )}
      {/* Info container */}
      <View
        style={{
          paddingRight: 20,
          paddingLeft: 20,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <View flex={1} flexDir="column" mr={7}>
          <View flexDir="row" alignItems="center" gap="1">
            <Text numberOfLines={1} style={{ includeFontPadding: false, flex: 1, fontSize: 14, marginRight: 5 }}>{pub?.name}</Text>

            {
              (!isNaN(+pub?.rating) && (+pub?.rating) > 0) &&
              <>
                <Text fontSize="xl" style={{ fontSize: 14 }}>{pub?.rating?.toFixed(1)}</Text>
                <Image
                  contentFit="contain"

                  style={{ width: 15, position: "relative", aspectRatio: 1 / 1 }}
                  source={images.StarFilled}
                  alt=""
                />
              </>
            }


          </View>

          {pub?.isOpen && <Text style={{ fontSize: 14, fontWeight: "bold" }}>{shippingTimeString}</Text>}
          {/* free delivery price */}
        </View>
        <View flexDir="column">
          {/* shipping price */}
          <View
            justifyContent="flex-end"
            alignItems="center"
            flexDir="row"
            gap={1}

            py={1}
          >
            <View style={{ width: 15, height: 15 }}>
              <Image
                source={images.WheelBlack}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {Math.floor(pub.shipping_price)} Lei
            </Text>
          </View>
          {/* distance */}
          <View
            justifyContent="flex-end"
            alignItems="center"
            flexDir="row"
            gap={1}
          >
            <View style={{ width: 15, height: 15 }}>
              <Image
                source={images.Locaiton}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {(distance / 1000).toFixed(1)} km
            </Text>
          </View>
          {/* Stars and location */}
          {/* <View>
            <Stars count={pub.rating} />
          </View> */}
        </View>
      </View>
    </View >
  );
};

export default memo(Pub);
