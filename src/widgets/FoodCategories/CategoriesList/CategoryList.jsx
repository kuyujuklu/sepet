import { FlatList, View } from "native-base";
import { memo, useEffect, useState } from "react";
import { Pressable, SafeAreaView } from "react-native";
import { useGetPubInfoQuery } from "../../../shared/api/pubs/pubsApi";
import CategoryCard from "./CategoryCard";
import PubInfoHeader from "../../Pub/PubInfoHeader";

const CategoryList = ({
  pubID,
  menuID,
  highlightedCategory,
  selectCategory,
}) => {
  const { data: pubData, error: pubError } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID },
  );

  const [shownCategories, setShownCategories] = useState([]);

  // Set shown categories based on menuID
  useEffect(() => {
    if (!menuID) return;

    if (!pubData?.categories) return;

    let filteredCategories = pubData.categories
      .filter((category) => category.visible)
      .filter((category) => category.menu_id === menuID)
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

  useEffect(() => {}, [pubError]);

  useEffect(() => {}, [pubData]);

  return (
    <SafeAreaView edges={[]}>
      {(!shownCategories || shownCategories.length === 0) && <PubInfoHeader pubID={pubID} />}
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 80 }}
        renderItem={({ item: category, index }) => (
          <>
            {index === 0 && <PubInfoHeader pubID={pubID} />}
            <Pressable onPress={() => selectCategory(category?.id)}>
              <CategoryCard
                isHightlighted={category?.highlighted}
                key={category?.id}
                category={category}
              />
            </Pressable>
          </>
        )}
        data={shownCategories || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </SafeAreaView>
  );
};

export default memo(CategoryList);
