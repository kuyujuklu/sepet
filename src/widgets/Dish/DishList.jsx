import { FlatList, View } from "native-base";
import { SafeAreaView } from "react-native";
import DishCard from "./DishCard";

const DishList = ({ dishes, pubID }) => {
  return (
    <SafeAreaView edges={[]}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item: dish }) => (
            <DishCard key={dish?.id} pubID={pubID} dish={dish} />
        )}
        data={dishes || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </SafeAreaView>
  );
};



export default DishList