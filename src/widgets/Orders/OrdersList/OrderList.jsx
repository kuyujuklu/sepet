import { useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import OrderCard from "./OrderCard";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import { CARD_GAP, SCREEN_PADDING } from "../../../constants/layout";

// Newest first. The list used to be cut to the six latest orders because
// every card fetched a whole menu; the cards are cheap now, so the client
// gets the history they came for.
const OrderList = ({
  orders,
  ListHeaderComponent,
  refreshing = false,
  onRefresh,
}) => {
  const sortedOrders = useMemo(
    () =>
      [...(orders ?? [])].sort(
        (a, b) =>
          GetTimeFromApiTimeString(b.created_time).getTime() -
          GetTimeFromApiTimeString(a.created_time).getTime(),
      ),
    [orders],
  );

  return (
    <FlatList
      data={sortedOrders}
      keyExtractor={(order) => String(order?.id)}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={["#059669"]}
          />
        ) : undefined
      }
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: 4,
        paddingBottom: 24,
      }}
      ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
      renderItem={({ item: order }) => <OrderCard order={order} />}
    />
  );
};

export default OrderList;
