import { Text, View } from "native-base";
import { Image } from "expo-image";
import { ENV } from "../../../constants/env/env";
import { images } from "../../../app/images/images";
import { GetShippingTimeString } from "../../../shared/utils/time";
import { useTranslation } from "react-i18next";

const CategoryCardWithPubInfo = ({ category, pub, usePubBg, distance }) => {
  const { t } = useTranslation();
  const imagePath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    (usePubBg
      ? "/images/pubs/bgs/" + pub.bg_image_file_name
      : "/images/categories/" + category?.image_file_name);

  const shippingWorkHours = {
    start: pub?.shipping?.shipping_work_start,
    end: pub?.shipping?.shipping_work_end,
  };

  const shippingTimeString = GetShippingTimeString(shippingWorkHours);

  const hasFreeDeliveryPrice =
    !isNaN(+pub?.shipping_free_delivery_price) &&
    +pub?.shipping_free_delivery_price > 0;


  return (
    <View maxWidth={400} style={{ width: "100%", alignSelf: "center" }}>
      {/* Image container */}
      <View
        style={{
          height: 160,
          paddingVertical: 10,
          overflow: "hidden",
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!pub.isOpen && (
          <View
            bg={"black"}
            w="full"
            position="absolute"
            py={8}
            justifyContent="flex-end"
            alignItems="center"
            zIndex={10}
            opacity={0.3}
            style={{ height: "120%" }}
          ></View>
        )}
        {category.image_file_name && (
          <Image
            alt=""
            resizeMode="contain"
            style={{ width: "100%", aspectRatio: 1 / 8 }}
            source={{ uri: imagePath }}
          />
        )}
        <View
          position={"absolute"}
          w="110%"
          h="120%"
          backgroundColor={"rgba(0, 0, 0, 0.5)"}
          borderWidth={2}
          px="15%"
          alignItems="center"
          justifyContent="center"
        >
          <View
            alignItems={"center"}
            justifyContent={"center"}
            flexDir={"row"}

          >
            <Text numberOfLines={1} fontSize={"2xl"} mr="5" fontWeight={"bold"} color={"#fff"} style={{ includeFontPadding: false, }}>

              {pub?.name}
            </Text>
            {/* free delivery price */}
            {
              (!isNaN(+pub?.rating) && (+pub?.rating) > 0) &&
              <>
                <Text fontSize="2xl" mr="1" fontWeight="bold" color="white" >{pub?.rating?.toFixed(1)}</Text>

                <Image
                  contentFit="contain"
                  style={{ width: 20, position: "relative", aspectRatio: 1 / 1 }}
                  source={images.StarFilled}
                  alt=""
                />
              </>
            }


          </View>
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
              <Text style={{ fontSize: 14 }} textAlign="center" color="white" fontWeight="bold">
                {t("pub_card.free_delivery_from")}{" "}
                {pub?.shipping_free_delivery_price} Lei
              </Text>
            </View>
          )}
          {!pub.isOpen && (
            <>
              <Text color="white" fontSize={18}>
                {t("home_page.pub_is_closed")}
              </Text>
              <Text color="white" fontSize={18}>
                {shippingTimeString}
              </Text>
            </>
          )}
        </View>


      </View>

      {/* Info container */}
      <View
        style={{
          paddingTop: 3,
          paddingRight: 20,
          paddingLeft: 20,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <View flexDir="row" alignItems="center" gap="1">
          <View style={{ width: 15, height: 15 }}>
            {pub?.shipping?.shipping_time_from ||
              pub?.shipping?.shipping_time_to ? (
              <Image
                source={images.ClockBlack}
                style={{ width: "100%", height: "100%" }}
                alt=""
              />
            ) : (
              ""
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {pub?.shipping?.shipping_time_from
              ? pub?.shipping?.shipping_time_from
              : ""}
            {pub?.shipping?.shipping_time_from &&
              pub?.shipping?.shipping_time_to
              ? " - "
              : ""}
            {pub?.shipping?.shipping_time_to
              ? pub?.shipping?.shipping_time_to
              : ""}{" "}
            min
          </Text>
          <View
            justifyContent="flex-end"
            alignItems="center"
            flexDir="row"
            gap={3}
            flex={1}
          >
            {/* shipping price */}
            <View
              justifyContent="flex-end"
              alignItems="center"
              flexDir="row"
              gap={1}
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
          </View>
        </View>
      </View>
    </View >
  );
};

export default CategoryCardWithPubInfo;
