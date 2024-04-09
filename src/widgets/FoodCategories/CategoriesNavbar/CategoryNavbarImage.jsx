import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "native-base";
import React, { useEffect, useRef } from "react";
import { Animated, Image } from "react-native";
import Underscore from "./Underscore";

const Category = ({ isSelected, imageSource, category }) => {
  const navigator = useNavigation();

  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  return (
    <Pressable
      flex={1}
      onPress={() =>
        navigator.navigate("FoodCategories", { foodCategory: category })
      }
    >
      <View alignItems={"center"} justifyContent={"center"}>
        <Animated.View
          style={{
            height: animationValue.interpolate({
                inputRange: [0, 1],
              outputRange: ["90%", "100%"],
            }),
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              aspectRatio: 1 / 1,
              height: "100%",
            }}
            alt="food image"
            source={imageSource}
          />
          {isSelected && <Underscore animationValue={animationValue} />}
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default Category;
