import { View } from "native-base";
import { Animated } from "react-native";

const Underscore = ({ animationValue }) => {
    return (
      <View
        w="100%"
        position={"absolute"}
        bottom={"0"}
        margin={"auto"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Animated.View
          style={{
            width: animationValue?.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "80%"],
            }),
            backgroundColor: "blue",
            borderRadius: 2,
            height: 3,
            bottom: -6,
            margin: "auto",
          }}
        ></Animated.View>
      </View>
    );
  };

export default Underscore