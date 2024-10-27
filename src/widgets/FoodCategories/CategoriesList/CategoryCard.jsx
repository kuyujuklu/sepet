import { Text, View } from "native-base";
import { ENV } from "../../../constants/env/env";
import { memo } from "react";
import { Image } from 'expo-image';


const CategoryCard = ({ category }) => {
  const imagePath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    "/images/categories/" +
    category?.image_file_name;

    return (
    <View maxWidth={400} style={{ width: "100%", alignSelf: "center" }}>
      {/* Image container */}
      <View
        style={{
          height: 160,
          overflow: "hidden",
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {category.image_file_name && (
          <Image
            alt=""
            contentFit="contain"
            style={{ width: "100%", aspectRatio: 1 / 8 }}
            source={{ uri: imagePath }}
          />
        )}
        <View
          position={"absolute"}
          w="100%"
          h="120%"
          backgroundColor={"rgba(0, 0, 0, 0.5)"}
          borderWidth={2}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text numberOfLines={1} fontSize={"2xl"} fontWeight={"bold"} color={"#fff"}>
            {category?.name}
          </Text>
        </View>
      </View>

      {/* Info container */}
      {/* <View
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
          {category?.name}
        </Text>
      </View> */}
    </View>
  );
};

export default memo(CategoryCard);
