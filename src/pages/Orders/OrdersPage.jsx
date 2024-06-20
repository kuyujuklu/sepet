import { Spinner, Text, View } from "native-base";
import Wrapper from "../Wrapper";
import { AnonymousProBold } from "../../constants/styles-constants";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectOrders } from "../../features/store/orders/ordersSlice";
import { Suspense, lazy, useEffect, useState } from "react";
import { OrderListWithAllClientOrders } from "../../widgets/Orders/OrdersList/OrderListWithAllClientOrders";
import { useNavigation } from "@react-navigation/native";

const LazyLargeComponent = lazy(() => {
  return new Promise((resolve) => setTimeout(resolve, 200)).then(
    () =>
      import("../../widgets/Orders/OrdersList/OrderListWithAllClientOrders"),
  );
});

const OrdersPage = () => {
  const { t } = useTranslation();
  const orders = useSelector(selectOrders);
  const navigator = useNavigation();
  const [areComponentsVisible, setAreComponentsVisible] = useState(false);
  useEffect(() => {
    const unsubscribeFocus = navigator.addListener("focus", () => {
      setTimeout(() => {
        setAreComponentsVisible(true);
      }, 10);
      setAreComponentsVisible(false);
    });
    const unsubscribeBlur = navigator.addListener("blur", () => {
      console.log("Blured");
      setAreComponentsVisible(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigator]);

  return (
    <Wrapper>
      {!areComponentsVisible && (
        <View flex={1} justifyContent={"center"} alignItems={"center"}>
          <Spinner width={30} height={30} />
        </View>
      )}
      {orders && orders.length < 0 ? (
        <View alignItems="center" mt={2} mb={3}>
          <Text textAlign="center" fontFamily={AnonymousProBold} fontSize={32}>
            {t("order_page.headline_no_orders")}
          </Text>
        </View>
      ) : (
        <></>
      )}

      <Suspense fallback={<Spinner />}>
        {areComponentsVisible && (
          <LazyLargeComponent
            upperComponent={
              <View alignItems="center" mt={2} mb={3}>
                <Text
                  textAlign="center"
                  fontFamily={AnonymousProBold}
                  fontSize={32}
                >
                  {orders && orders.length > 0
                    ? t("order_page.headline")
                    : t("order_page.headline_no_orders")}
                </Text>
              </View>
            }
          />
        )}
      </Suspense>
    </Wrapper>
  );
};

export default OrdersPage;
