import { Text, View } from "native-base";
import { appColors } from "../../constants/styles-constants";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const MenuItem = ({ isSelected, menu }) => {
  const selectedAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(selectedAnimation, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
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
          borderWidth: selectedAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
          borderColor: "#999",
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
            outputRange: ["transparent", appColors.DarkRed],
          }),
        }}
      >
        <Text color={isSelected ? "white" : "coolGray.700"}>{menu?.name}</Text>
      </Animated.View>
    </View>
  );
};

export default MenuItem;
