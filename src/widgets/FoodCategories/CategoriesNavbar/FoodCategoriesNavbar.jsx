import { FlatList, ScrollView, View } from "native-base";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import CategoryNavbarImage from "./CategoryNavbarImage";
import { categories } from "../../../app/static-data/data";
import { images } from "../../../app/images/images";

export const placeholderAllCategory = {
  image: images.AllFood,
  value: "",
};

export const placeholderCategories = {
  [categories.Sales]: {
    image: images.Sales,
    value: categories.Sales,
    priority: 1
  },
  [categories.Asian]: {
    image: images.Sushi,
    value: categories.Asian,
  },
  [categories.Flowers]: {
    image: images.Flowers,
    value: categories.Flowers,
  },
  [categories.FastFood]: {
    image: images.FastFood,
    value: categories.FastFood,
  },
  [categories.Breakfast]: {
    image: images.Breakfast,
    value: categories.Breakfast,
  },
  [categories.Grill]: {
    image: images.Grill,
    value: categories.Grill,
  },
  [categories.Dessert]: {
    image: images.Cupcake,
    value: categories.Dessert,
  },
  [categories.Pasta]: {
    image: images.Spaghetti,
    value: categories.Pasta,
  },
  // [categories.Pancakes]: {
  //   image: images.Pancakes,
  //   value: categories.Pancakes,
  // },
  [categories.Soup]: {
    image: images.Soup,
    value: categories.Soup,
  },
  [categories.Alcohol]: {
    image: images.Alcohol,
    value: categories.Alcohol,
  },
  [categories.EastFood]: {
    image: images.EastFood,
    value: categories.EastFood,
  },
  [categories.Flour]: {
    image: images.Flour,
    value: categories.Flour,
  },
  [categories.HomeFood]: {
    image: images.HomeFood,
    value: categories.HomeFood,
  },
  [categories.Meat]: {
    image: images.Meat,
    value: categories.Meat,
  },
  [categories.Kebab]: {
    image: images.Kebab,
    value: categories.Kebab,
  },
  [categories.Salad]: {
    image: images.Salad,
    value: categories.Salad,
  },
  [categories.Snacks]: {
    image: images.Snacks,
    value: categories.Snacks,
  },
};

export const categoryNamesArray = Object.keys(placeholderCategories);

const FoodCategoriesNavbar = ({ selectedCategory, possibleCategoryNames = [] }) => {
  const possibleCategoryNamesSorted = useMemo(() => {
    if (!possibleCategoryNames) return [];

    return possibleCategoryNames.sort((x, y) => {
      const a = placeholderCategories[x];
      const b = placeholderCategories[y];

      if (a?.priority && b?.priority) {
        return a?.priority - b?.priority
      }
      if (!a?.priority && b?.priority) {
        return 1;
      }
      if (!b?.priority && a?.priority) {
        return -1;
      }
      return 0
    });
  }, [possibleCategoryNames])

  const underScoreAnimation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!selectedCategory) return;

    underScoreAnimation.setValue(0);
    Animated.timing(underScoreAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    scrollFlatListToActiveIndex();
  }, [selectedCategory]);

  const flatListRef = useRef(null);

  const scrollFlatListToActiveIndex = useCallback(() => {
    if (!flatListRef?.current) return;
    if (!possibleCategoryNamesSorted) return;

    const indexOfSelectedCategory = possibleCategoryNamesSorted.findIndex(
      (categoryName) =>
        placeholderCategories[categoryName].value === selectedCategory,
    );

    if (indexOfSelectedCategory < 0) return;

    flatListRef.current.scrollToIndex({
      index: indexOfSelectedCategory,
      animated: true,
      viewPosition: 0.5,
    });
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

        <View style={{ flex: 1, paddingTop: 2 }}>
          <FlatList
            ref={flatListRef}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            horizontal
            onScrollToIndexFailed={() => {
              const wait = new Promise((resolve) => setTimeout(resolve, 250));
              wait.then(() => {
                scrollFlatListToActiveIndex();
              });
            }}
            renderItem={({ item: categoryName, index }) => (
              <View flex={1} style={{ height: "90%" }}>
                <CategoryNavbarImage
                  key={categoryName}
                  isSelected={
                    selectedCategory ===
                    placeholderCategories[categoryName]?.value
                  }
                  imageSource={placeholderCategories[categoryName]?.image}
                  category={placeholderCategories[categoryName]?.value}
                />
              </View>
            )}
            data={possibleCategoryNamesSorted || []}
            ItemSeparatorComponent={() => <View width={4} />}
          />
        </View>

        {/* <ScrollView horizontal>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              gap: 20,
              paddingVertical: 6,
            }}
          ></View>
        </ScrollView> */}
      </View>
    </View>
  );
};

export default FoodCategoriesNavbar;
