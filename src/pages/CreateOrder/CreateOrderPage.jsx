import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import CreateOrder from "../../widgets/Orders/CreateOrder/CreateOrder";
import { useSelector } from "react-redux";
import { selectBasket } from "../../features/store/basket/basketSlice";
import { useTranslation } from "react-i18next";

const CreateOrderPage = ({ route }) => {
  const { t } = useTranslation();
  const itemsPrice = route?.params?.itemsPrice;
  const deliveryPrice = route?.params?.deliveryPrice;
  const smallOrderFee = route?.params?.smallOrderFee;
  const shippingTimeFrom = route?.params?.shippingTimeFrom;
  const shippingTimeTo = route?.params?.shippingTimeTo;
  const pubID = route?.params?.pubID;
  const basket = useSelector(selectBasket);

  return (
    <Wrapper>

      <View flex={1}>
        <CreateOrder
          basket={basket}
          pubID={pubID}
          shippingTimeFrom={shippingTimeFrom}
          shippingTimeTo={shippingTimeTo}
          itemsPrice={itemsPrice}
          deliveryPrice={deliveryPrice}
          smallOrderFee={smallOrderFee}
        />
      </View>
    </Wrapper>
  );
};

export default CreateOrderPage;
