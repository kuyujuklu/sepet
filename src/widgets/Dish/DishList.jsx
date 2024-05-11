import { FlatList, View } from "native-base";
import { SafeAreaView } from "react-native";
import DishCard from "./DishCard";

const DishList = ({ dishes, pubID, pub }) => {
  return (
    <SafeAreaView edges={[]} style={{ marginBottom: 40 }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}
        renderItem={({ item: dish }) => (
          <DishCard key={dish?.id} pubID={pubID} pub={pub} dish={dish} />
        )}
        data={dishes || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </SafeAreaView>
  );
};

export default DishList;
