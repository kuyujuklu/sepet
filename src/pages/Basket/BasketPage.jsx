import DishList from "../../widgets/Dish/DishList";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { useSelector } from "react-redux";
import {
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import BasketCreateOrderButton from "../../widgets/Basket/BasketCreateOrderButton";
import Wrapper from "../Wrapper";
import { Text, View } from "native-base";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import AnimatedNumber from "react-native-animated-numbers";
import { AnonymousProBold } from "../../constants/styles-constants";

const BasketPage = () => {
  const { t } = useTranslation();
  const pubID = useSelector(selectBasketPubID);
  const { data: pubData } = useGetPubInfoQuery({ pubID }, { pollingInterval: 20000, skip: !pubID });

  const basket = useSelector(selectBasket);

  const itemsPrice = Object.keys(basket).reduce((acc, key) => {
    const dish = basket[key];
    return acc + dish.count * dish.price;
  }, 0);

  return (
    <Wrapper>
      <View flex={1}>
        <DishList
          upperElement={
            <View
              mt={3}
              flexDir="row"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                textAlign="center"
                fontSize={25}
                textTransform="uppercase"
                fontWeight="bold"
              >
                {t("basket_page.headline")} (
              </Text>
              {itemsPrice ? <Number number={itemsPrice} /> : <></>}
              <Text textAlign="center" fontSize={25} fontWeight="bold">
                {itemsPrice ? " Lei" : t("basket_page.empty")})
              </Text>
            </View>
          }
          pubID={pubID}
          dishes={pubData?.dishes?.filter(
            (dish) => basket[dish.id]?.count && basket[dish.id]?.count > 0,
          )}
        />
      </View>

      <View position="absolute" w="full" px="2" bottom="60" borderRadius={15}>
        <BasketCreateOrderButton itemsPrice={itemsPrice} isClosed={!pubData?.pub.isOpen} />
      </View>
    </Wrapper>
  );
};

const Number = memo(function Number({ number }) {
  return (
    <AnimatedNumber
      includeComma
      animateToNumber={number}
      animationDuration={500}
      fontStyle={{
        fontSize: 25,
        fontFamily: AnonymousProBold,
        fontWeight: "bold",
        textAlign: "center",
      }}
    />
  );
});

export default BasketPage;
