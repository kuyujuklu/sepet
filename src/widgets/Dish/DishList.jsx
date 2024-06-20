import { FlatList, View } from "native-base";
import { SafeAreaView } from "react-native";
import DishCard from "./DishCard";
import PubInfoHeader from "../Pub/PubInfoHeader";

const DishList = ({ dishes, pubID, pub, upperElement }) => {
  return (
    <SafeAreaView edges={[]} >
      {(!dishes || dishes.length === 0) && upperElement}
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 70 }}
        renderItem={({ item: dish, index }) => (
          <>
            {index === 0 ? upperElement : <></>}
            <DishCard key={dish?.id} pubID={pubID} pub={pub} dish={dish} />
          </>
        )}
        data={dishes || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </SafeAreaView>
  );
};

export default DishList;
