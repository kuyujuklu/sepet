import { useSelector } from "react-redux";
import { selectOrders } from "../../features/store/orders/ordersSlice";
import { useMemo } from "react";
import Wrapper from "../Wrapper";
import { Spinner, Text, View } from "native-base";
import {
  ConvertApiTimeToLocalDayMonth,
  ConvertApiTimeToLocalDayMonthYear,
} from "../../shared/utils/time";
import { SafeAreaView } from "react-native";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { useTranslation } from "react-i18next";
import {
  AnonymousProBold,
  AnonymousProRegular,
} from "../../constants/styles-constants";
import OrderInfo from "../../widgets/Orders/OrdersList/OrderInfo";

const OrderInfoPage = ({ route }) => {
  const orderID = route?.params.orderID;

  return (
    <Wrapper>
      <OrderInfo orderID={orderID}/>
    </Wrapper>
  );
};

export default OrderInfoPage;
