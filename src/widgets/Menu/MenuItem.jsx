import { Text, View } from "native-base";
import { appColors } from "../../constants/styles-constants";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const MenuItem = ({ isSelected, menu }) => {
  const selectedAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(selectedAnimation, {
      toValue: isSelected ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  return (
    <View p={2}>
      <Animated.View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 20,
          borderRadius: 10,

          transform: [
            {
              scale: selectedAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            },
          ],
          backgroundColor: selectedAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ["white", appColors.DarkRed],
          }),
        }}
      >
        <Animated.Text
        color={"coolGray.200"}
          style={{
            color: selectedAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ["#374151", "#ffffff"],
            }),
          }}
        >
          {menu?.name}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

export default MenuItem;
