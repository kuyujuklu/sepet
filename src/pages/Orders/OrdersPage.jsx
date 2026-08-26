import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import OrderListWithAllClientOrders from "../../widgets/Orders/OrdersList/OrderListWithAllClientOrders";
import { BigCardsSkeleton } from "../../widgets/Skeletons/Skeleton";
import { selectOrders } from "../../features/store/orders/ordersSlice";
import { images } from "../../app/images/images";
import { Screens } from "../../app/navigation/screens";

// The orders arrive over a websocket, so an empty list right after mount
// means "not delivered yet", not "no orders". Without this grace period the
// screen flashes "you have not ordered anything" at every returning client.
const EMPTY_GRACE_MS = 900;

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

  const orders = useSelector(selectOrders);
  const [hasWaited, setHasWaited] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHasWaited(true), EMPTY_GRACE_MS);

    return () => clearTimeout(timeout);
  }, []);

  const isEmpty = !orders || orders.length === 0;

  const renderBody = () => {
    if (isEmpty && !hasWaited) {
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

    return <OrderListWithAllClientOrders />;
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
