import { ScrollView, View } from "native-base";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import CategoryNavbarImage from "./CategoryNavbarImage";
import { categories } from "../../../app/static-data/data";
import { images } from "../../../app/images/images";

export const placeholderAllCategory = {
  image: require("../../../../assets/images/all_foods.png"),
  value: "",
};

export const placeholderCategories = {
  [categories.Asian]: {
    image: images.Sushi,
    value: "asian",
  },
  [categories.FastFood]: {
    image: images.FastFood,
    value: "fast_food",
  },
  [categories.Breakfast]: {
    image: images.Breakfast,
    value: "breakfast",
  },
  [categories.Grill]: {
    image: images.Grill,
    value: "grill",
  },
  [categories.Dessert]: {
    image: images.Cupcake,
    value: "dessert",
  },
  [categories.Pasta]: {
    image: images.Spaghetti,
    value: "pasta",
  },
  [categories.Pancakes]: {
    image: images.Pancakes,
    value: "pancakes",
  },
  [categories.Soup]: {
    image: images.Soup,
    value: "soup",
  },
};

const categoriesArray = Object.keys(placeholderCategories);

const FoodCategoriesNavbar = ({ selectedCategory }) => {
  const underScoreAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!selectedCategory) return;

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
      <View style={{ flex: 1, flexDirection: "row", gap: 20 }}>
        <View py={2}>
          <CategoryNavbarImage
            isSelected={selectedCategory === placeholderAllCategory.value}
            imageSource={placeholderAllCategory.image}
            category={placeholderAllCategory.value}
          />
        </View>
        <ScrollView horizontal>
          <View style={{ flex: 1, flexDirection: "row", gap: 20, paddingVertical: 6}}>
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
        </ScrollView>
      </View>
    </View>
  );
};

export default FoodCategoriesNavbar;
