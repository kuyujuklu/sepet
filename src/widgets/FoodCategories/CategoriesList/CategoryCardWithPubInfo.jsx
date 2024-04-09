import { Text, View } from "native-base";
import { Image } from "react-native";

const CategoryCardWithPubInfo = ({ category, pub }) => {
  const imagePath =
    process.env.EXPO_PUBLIC_API_URL +
    "/static/images/categories/" +
    category?.image_file_name;

  return (
    <View maxWidth={400} style={{width: "100%", alignSelf: "center"}}>
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
            {category?.name}
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
        <Text fontSize={"lg"} fontWeight={"medium"}>
          {pub?.name}
        </Text>
      </View>
    </View>
  );
};

export default CategoryCardWithPubInfo;
