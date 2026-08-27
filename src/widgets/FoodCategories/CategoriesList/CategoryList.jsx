import { FlatList, View } from "native-base";
import { memo, useEffect, useState } from "react";
import { Pressable, SafeAreaView, TouchableOpacity } from "react-native";
import { usePubInfo } from "../../../shared/hooks/usePubInfo";
import CategoryCard from "./CategoryCard";
import { BigCardsSkeleton } from "../../Skeletons/Skeleton";
import { SCREEN_PADDING, CARD_GAP } from "../../../constants/layout";

const CategoryList = ({
  pubID,
  menuID,
  highlightedCategory,
  selectCategory,
}) => {
  const { data: pubData } = usePubInfo({ pubID });

  const [shownCategories, setShownCategories] = useState([]);

  // Set shown categories based on menuID. Without one every visible category
  // is shown: the bottom menu tabs are gone, so there is nothing to scope to.
  useEffect(() => {
    if (!pubData?.categories) return;

    let filteredCategories = pubData.categories
      .filter((category) => category.visible)
      .filter((category) => !menuID || category.menu_id === menuID)
      .map((category) => {
        return {
          ...category,
          highlighted: category.id === highlightedCategory,
        };
      });

    filteredCategories.sort((a, b) =>
      a.id === highlightedCategory ? -1 : b.id === highlightedCategory ? 1 : 0,
    );

    setShownCategories(filteredCategories);
  }, [pubData, menuID]);

  if (!pubData) return <BigCardsSkeleton count={3} />;

  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: 4,
          paddingBottom: 150,
        }}
        renderItem={({ item: category }) => (
          <View key={category.id}>
            <TouchableOpacity onPress={() => selectCategory(category?.id)}>
              <CategoryCard
                isHightlighted={category?.highlighted}
                key={category?.id}
                category={category}
              />
            </TouchableOpacity>
          </View>
        )}
        data={shownCategories || []}
        ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
      />
    </SafeAreaView>
  );
};

export default memo(CategoryList);
