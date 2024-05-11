import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import { OrderListWithAllClientOrders } from "../../widgets/Orders/OrdersList/OrderListWithAllClientOrders";
import { AnonymousProBold } from "../../constants/styles-constants";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectOrders } from "../../features/store/orders/ordersSlice";

const OrdersPage = () => {
  const { t } = useTranslation();
  const orders = useSelector(selectOrders);
  return (
    <Wrapper>
      <View alignItems="center" mt={6} mb={3}>
        <Text textAlign="center" fontFamily={AnonymousProBold} fontSize={32}>
          {orders && orders.length > 0
            ? t("order_page.headline")
            : t("order_page.headline_no_orders")}
        </Text>
      </View>
      <OrderListWithAllClientOrders />
    </Wrapper>
  );
};

export default OrdersPage;
