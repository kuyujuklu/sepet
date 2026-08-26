import { FlatList, View } from "native-base";
import { SafeAreaView } from "react-native";
import DishCard from "./DishCard";
import { SCREEN_PADDING, CARD_GAP } from "../../constants/layout";

const DishList = ({ dishes, pubID, pub, isPubOpen, isAvailableForDelivery }) => {
  return (
    // flex so the list can actually scroll to its end inside the screen
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: 4,
          paddingBottom: 150,
        }}
        renderItem={({ item: dish }) => (
          <DishCard
            key={dish?.id}
            pubID={pubID}
            pub={pub}
            dish={dish}
            isPubOpen={isPubOpen}
            isAvailableForDelivery={isAvailableForDelivery}
          />
        )}
        data={dishes || []}
        ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
      />
    </SafeAreaView>
  );
};

export default DishList;
