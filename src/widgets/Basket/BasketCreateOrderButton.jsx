import { useNavigation } from "@react-navigation/native";
import { Button, Spinner } from "native-base";
import { useSelector } from "react-redux";
import {
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { useTranslation } from "react-i18next";

const BasketCreateOrderButton = () => {
  const { t } = useTranslation();
  const basket = useSelector(selectBasket);
  const pubID = useSelector(selectBasketPubID);
  const navigator = useNavigation();

  const basketIsEmpty = !basket || Object.keys(basket).length === 0;

  const itemsPrice = Object.keys(basket).reduce((acc, key) => {
    const dish = basket[key];
    return acc + dish.count * dish.price;
  }, 0);

  const {
    data: pubData,
    error: gettingPubError,
    isLoading,
  } = useGetPubInfoQuery({ pubID: pubID }, { skip: !pubID });

  const deliveryPrice = 5;
  const smallOrderFee = 3;

  return (
    <Button
      disabled={basketIsEmpty || !pubData?.pub}
      background={
        basketIsEmpty || !pubData?.pub ? "coolGray.400" : "emerald.600"
      }
      borderRadius={15}
      onPress={() => {
        navigator.navigate("CreateOrder", {
          itemsPrice,
          deliveryPrice,
          smallOrderFee,
          pubID: pubID,
          shippingTimeFrom: pubData?.pub?.shipping?.shipping_time_from,
          shippingTimeTo: pubData?.pub?.shipping?.shipping_time_to,
        });
      }}
    >
      {isLoading ? <Spinner /> : t("basket_page.create_order_button")}
    </Button>
  );
};

export default BasketCreateOrderButton;
