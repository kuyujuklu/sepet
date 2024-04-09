import { View } from "native-base";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import CategoryNavbarImage from "./CategoryNavbarImage";
import { categories } from "../../../app/static-data/data";

export const placeholderCategories = {
  [categories.Sushi]: {
    image: require("../../../../assets/images/categories_sushi.png"),
    value: "sushi",
  },
  [categories.Drinks]: {
    image: require("../../../../assets/images/categories_cup.png"),
    value: "drinks",
  },
  [categories.Beer]: {
    image: require("../../../../assets/images/categories_beer.png"),
    value: "beer",
  },
  [categories.Burger]: {
    image: require("../../../../assets/images/categories_burger.png"),
    value: "burger",
  },
  All: {
    image: require("../../../../assets/images/three_points.png"),
    value: "",
  },
};

const categoriesArray = Object.keys(placeholderCategories);

const FoodCategoriesNavbar = ({ selectedCategory}) => {
  const underScoreAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!selectedCategory) return;

    console.log("animating");

    underScoreAnimation.setValue(0);
    Animated.timing(underScoreAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory]);

  return (
    <View
      py="1"
      px="3"
      flexDir={"row"}
      height={"80px"}
      w="full"
      bgColor={"#fff"}
      borderRadius={"3xl"}
    >
      {categoriesArray.map((category) => (
        <CategoryNavbarImage
          key={category.key}
          isSelected={
            selectedCategory === placeholderCategories[category].value
          }
          imageSource={placeholderCategories[category].image}
          category={placeholderCategories[category].value}
        />
      ))}
    </View>
  );
};

export default FoodCategoriesNavbar;
