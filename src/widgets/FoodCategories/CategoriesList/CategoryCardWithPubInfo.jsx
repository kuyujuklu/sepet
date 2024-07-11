import { Text, View } from "native-base";
import { Image } from "expo-image";
import { ENV } from "../../../constants/env/env";
import { images } from "../../../app/images/images";
import { GetShippingTimeString } from "../../../shared/utils/time";
import { useTranslation } from "react-i18next";

const CategoryCardWithPubInfo = ({ category, pub, usePubBg, distance }) => {
  console.log("use pub bg: ", usePubBg);
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
            opacity={0.7}
            style={{ height: "110%" }}
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
          w="120%"
          h="120%"
          backgroundColor={"rgba(0, 0, 0, 0.5)"}
          borderWidth={2}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontSize={"2xl"} fontWeight={"bold"} color={"#fff"}>
            {pub?.name}
          </Text>
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
          <View style={{ width: 20, height: 20 }}>
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
          <Text fontSize={"md"} fontWeight={"medium"}>
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
            flex={1}
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
  );
};

export default CategoryCardWithPubInfo;
