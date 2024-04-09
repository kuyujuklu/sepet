import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import CreateOrder from "../../widgets/Orders/CreateOrder/CreateOrder";
import { useSelector } from "react-redux";
import { selectBasket } from "../../features/store/basket/basketSlice";

const CreateOrderPage = ({route}) => {

  const itemsPrice = route?.params?.itemsPrice;
  const deliveryPrice = route?.params?.deliveryPrice;
  const smallOrderFee = route?.params?.smallOrderFee;
  const shippingTimeFrom = route?.params?.shippingTimeFrom;
  const shippingTimeTo = route?.params?.shippingTimeTo;
  const pubID = route?.params?.pubID;
  const basket = useSelector(selectBasket)

  console.log("From: ", shippingTimeFrom)
  console.log("To: ", shippingTimeTo)
  console.log("Delivery price: ", deliveryPrice)
  console.log("order fee: ", smallOrderFee)
  console.log("pubID: ", pubID)
  console.log("basket: ", basket)

  return ( <Wrapper>
    <Text
      fontSize={25}
      textTransform={"uppercase"}
      fontWeight={"bold"}
      textAlign={"center"}
      mb={5}
    >
      Create order
    </Text>

    <View flex={1}>
      <CreateOrder basket={basket} pubID={pubID} shippingTimeFrom={shippingTimeFrom} shippingTimeTo={shippingTimeTo} itemsPrice={itemsPrice} deliveryPrice={deliveryPrice} smallOrderFee={smallOrderFee} />
    </View>

  </Wrapper>
  );
};

export default CreateOrderPage;
