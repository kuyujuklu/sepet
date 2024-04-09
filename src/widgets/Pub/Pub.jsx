import { Animated, Image } from "react-native";
import Stars from "./Stars";
import { Text, View } from "native-base";
import { useEffect, useRef } from "react";

const Pub = ({ pub, isViewable }) => {
  const bgPath =
    process.env.EXPO_PUBLIC_API_URL +
    "/static/images/pubs/bgs/" +
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
    <View style={{ width: 300}}>
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
        <Image
          resizeMode="contain"
          style={{ width: "120%", aspectRatio: 1 / 8 }}
          source={{ uri: bgPath }}
          alt="smthng"
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
        {/* Stars and location */}
        <View>
          <Stars count={pub.rating} />
        </View>
      </View>
    </View>
  );
};

export default Pub;
