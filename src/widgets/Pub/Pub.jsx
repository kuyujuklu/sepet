import { Animated } from "react-native";
import Stars from "./Stars";
import { Text, View } from "native-base";
import { memo, useEffect, useRef, useState } from "react";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import { Image } from "expo-image";

const Pub = ({ pub, isViewable, distance }) => {
  const bgPath =
    ENV.API_HTTP_URL +
    ENV.API_STATIC_PATH +
    "/images/pubs/bgs/" +
    pub.bg_image_file_name;

  const scaleAnimation = useRef(new Animated.Value(0)).current;

  // Animate the image when it becomes visible
  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: isViewable ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isViewable]);

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
          contentFit="contain"
          style={{ width: 340, aspectRatio: 1 / 8 }}
          source={{ uri: bgPath }}
          alt=""
        />
      </Animated.View>

      {/* Info container */}
      <View
        style={{
          paddingTop: 10,
          paddingRight: 20,
          paddingLeft: 20,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 18 }}>{pub.name}</Text>
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
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>{(distance/ 1000).toFixed(1)} km</Text>
        </View>
        {/* Stars and location */}
        <View>
          <Stars count={pub.rating} />
        </View>
      </View>
    </View>
  );
};

export default memo(Pub);
