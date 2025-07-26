import { useEffect } from "react";
import Wrapper from "../Wrapper";
import OrderInfo from "../../widgets/Orders/OrdersList/OrderInfo";

const OrderInfoPage = ({ route }) => {
  const orderID = route?.params.orderID;

  return (
    <Wrapper>
      <OrderInfo orderID={orderID} />
    </Wrapper>
  );
};

export default OrderInfoPage;
