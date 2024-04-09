import { Animated, Text } from "react-native";
import { styles } from "./navbar.style";
import { useEffect, useState } from "react";

const NavbarExpandMore = ({ expanded }) => {
  //from 0 to 1
  const [expandedSize] = useState(new Animated.Value(0));

  useEffect(() => {
    expandedSize.stopAnimation();
    Animated.timing(expandedSize, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const [heightOfContainer, setHeightOfContainer] = useState(0)

  return (
    <Animated.View
      onLayout={({nativeEvent}) => {setHeightOfContainer(nativeEvent.layout.height)}}
      style={{
        ...styles.expandMore(expanded),
        width: expandedSize.interpolate({
          inputRange: [0, 1],
          outputRange: ["0%", "80%"],
        }),
        padding: expandedSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 20],
        }),
        height: expandedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 150]
        }),
        top: expandedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -heightOfContainer]
        })
      }}
    >
      {expanded && <>
        <Text style={{marginBottom: 4, fontWeight: "medium", color: "#666", borderWidth: 1, padding: 5, borderColor: "#999", borderRadius: 8, }}>SOME TEXT TTTTT TTT</Text>
        <Text style={{marginBottom: 4, fontWeight: "medium", color: "#666", borderWidth: 1, padding: 5, borderColor: "#999", borderRadius: 8, }}>SOME TEXT TTTTT TTT</Text>
        <Text style={{marginBottom: 4, fontWeight: "medium", color: "#666", borderWidth: 1, padding: 5, borderColor: "#999", borderRadius: 8, }}>SOME TEXT TTTTT TTT</Text>
      </>}
    </Animated.View>
  );
};

export default NavbarExpandMore;
