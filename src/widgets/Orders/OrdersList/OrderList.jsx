import { FlatList, View } from "native-base";
import OrderCard from "./OrderCard";

const OrderList = ({ orders }) => {
  return (
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item: order }) => (
            <OrderCard key={order?.id} order={order} />
        )}
        data={orders || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
  );
};

export default OrderList