import { FlatList, Spinner, Text, View } from "native-base";
import OrderCard from "./OrderCard";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import { Suspense, useMemo } from "react";
import { images } from "../../../app/images/images";
import { Image, TouchableOpacity } from "react-native";
import { AnonymousProBold } from "../../../constants/styles-constants";

const OrderList = ({ orders, upperComponent }) => {
  const filteredOrders = useMemo(() => {
    let filteredOrders = [...orders];

    filteredOrders?.sort(
      (a, b) =>
        GetTimeFromApiTimeString(b.created_time).getTime() -
        GetTimeFromApiTimeString(a.created_time).getTime(),
    );

    if (filteredOrders.length > 6) {
      filteredOrders = filteredOrders.slice(0, 6);
    }

    return filteredOrders;
  }, [orders]);

  return (
    <>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
        renderItem={({ item: order, index }) => (
          <>
            {index === 0 && upperComponent}
            <OrderCard key={order?.id} order={order} />
          </>
        )}
        data={filteredOrders || []}
        ItemSeparatorComponent={() => <View height={5} />}
      />
    </>
  );
};

export default OrderList;
