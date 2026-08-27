import { useCallback, useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import OrderListWithAllClientOrders from "../../widgets/Orders/OrdersList/OrderListWithAllClientOrders";
import { BigCardsSkeleton } from "../../widgets/Skeletons/Skeleton";
import { selectOrders, setOrders } from "../../features/store/orders/ordersSlice";
import { useGetAllOrdersForClientQuery } from "../../shared/api/ordersApi/ordersApi";
import { images } from "../../app/images/images";
import { Screens } from "../../app/navigation/screens";

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyIcon: { width: 64, height: 64, opacity: 0.35 },
  emptyTitle: { fontSize: 19, fontWeight: "bold", color: "#111", textAlign: "center" },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  emptyButton: {
    backgroundColor: "#059669",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const dispatch = useDispatch();

  const orders = useSelector(selectOrders);

  // GET /orders paints the screen; the websocket (OrdersPreloader) keeps it
  // up to date afterwards. The list used to be websocket-only, which is why
  // it needed a 900 ms grace timer before it dared say "no orders" - an empty
  // list simply meant "the push has not landed yet". A request that has
  // answered is an answer.
  const {
    data: ordersData,
    isLoading,
    isFetching: isRefreshing,
    refetch,
  } = useGetAllOrdersForClientQuery({});

  // Written into the same slice OrderCard/OrderInfo already read from, so the
  // websocket and this share one source of truth
  useEffect(() => {
    if (!Array.isArray(ordersData?.orders)) return;

    dispatch(setOrders({ orders: ordersData.orders }));
  }, [ordersData, dispatch]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const isEmpty = !orders || orders.length === 0;

  const renderBody = () => {
    if (isEmpty && isLoading) {
      return (
        <View style={{ paddingTop: 8 }}>
          <BigCardsSkeleton count={3} />
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View style={styles.empty}>
          <Image
            source={images.OrderList}
            style={styles.emptyIcon}
            contentFit="contain"
            alt=""
          />
          <Text style={styles.emptyTitle}>
            {t("order_page.headline_no_orders")}
          </Text>
          <Text style={styles.emptyText}>{t("order_page.no_orders_text")}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emptyButton}
            onPress={() => navigator.navigate(Screens.Home)}
          >
            <Text style={styles.emptyButtonText}>
              {t("order_page.no_orders_button")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <OrderListWithAllClientOrders
        refreshing={isRefreshing}
        onRefresh={refresh}
      />
    );
  };

  return (
    <Wrapper>
      <AppHeader
        showBack
        showAddress={false}
        right={null}
        title={t("order_page.headline")}
      />

      {renderBody()}
    </Wrapper>
  );
};

export default OrdersPage;
