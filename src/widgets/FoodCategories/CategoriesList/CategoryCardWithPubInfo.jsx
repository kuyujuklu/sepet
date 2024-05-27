import { Text, View } from "native-base";
import { Image } from "expo-image";
import { ENV } from "../../../constants/env/env";
import { images } from "../../../app/images/images";

const CategoryCardWithPubInfo = ({ category, pub, usePubBg, distance }) => {
  console.log("use pub bg: ", usePubBg);
  const imagePath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    (usePubBg
      ? "/images/pubs/bgs/" + pub.bg_image_file_name
      : "/images/categories/" + category?.image_file_name);

  return (
    <View maxWidth={400} style={{ width: "100%", alignSelf: "center" }}>
      {/* Image container */}
      <View
        style={{
          height: 160,
          overflow: "hidden",
          borderRadius: 26,
          borderBottomWidth: 12,
          borderTopWidth: 4,
          borderRightWidth: 2,
          borderLeftWidth: 2,
          borderColor: "#333",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
          <Text fontSize={"lg"} fontWeight={"medium"}>
            {pub?.shipping?.shipping_time_from
              ? pub?.shipping?.shipping_time_from
              : ""}
            {pub?.shipping?.shipping_time_from &&
            pub?.shipping?.shipping_time_to
              ? " - "
              : ""}
            {pub?.shipping?.shipping_time_to
              ? pub?.shipping?.shipping_time_to
              : ""}
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
