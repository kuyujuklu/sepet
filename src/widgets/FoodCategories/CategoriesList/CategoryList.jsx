import { FlatList, View } from "native-base";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView } from "react-native";
import { useGetPubInfoQuery } from "../../../shared/api/pubs/pubsApi";
import CategoryCard from "./CategoryCard";

const CategoryList = ({
  pubID,
  menuID,
  highlightedCategory,
  selectCategory,
}) => {
  const { data: pubData, error: pubError } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID }
  );

  const [shownCategories, setShownCategories] = useState([]);

  // Set shown categories based on menuID
  useEffect(() => {
    console.log("menu id: ", menuID);
    if (!menuID) return;

    console.log("menu id: ", menuID);

    if(!pubData?.categories) return;

    let filteredCategories = pubData.categories
      .filter((category) => category.visible)
      .filter((category) => category.menu_id === menuID)
      .map((category) => {
        return {
          ...category,
          highlighted: category.id === highlightedCategory,
        };
      });

      filteredCategories.sort((a, b) => a.id === highlightedCategory ? -1 : b.id === highlightedCategory ? 1 : 0)

    setShownCategories(filteredCategories);
  }, [pubData, menuID]);

  useEffect(() => {
    pubError && console.log("pubError in categories list: ", pubError);
  }, [pubError]);

  useEffect(() => {
    console.log("pubData in categories list: ", pubData?.categories);
  }, [pubData]);

  return (
    <SafeAreaView edges={[]}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item: category }) => (
          <Pressable onPress={() => selectCategory(category?.id)}>
            <CategoryCard
              isHightlighted={category?.highlighted}
              key={category?.id}
              category={category}
            />
          </Pressable>
        )}
        data={shownCategories || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </SafeAreaView>
  );
};

export default CategoryList;
