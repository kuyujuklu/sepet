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

const BasketPage = () => {
  const { t } = useTranslation();
  const pubID = useSelector(selectBasketPubID);
  const { data: pubData } = useGetPubInfoQuery({ pubID }, { skip: !pubID });

  const basket = useSelector(selectBasket);

  return (
    <Wrapper>
      <Text
        fontSize={25}
        textTransform={"uppercase"}
        fontWeight={"bold"}
        textAlign={"center"}
        mb={10}
      >
        {t("basket_page.headline")}
      </Text>

      <View flex={1}>
        <DishList
          pubID={pubID}
          dishes={pubData?.dishes?.filter(
            (dish) => basket[dish.id]?.count && basket[dish.id]?.count > 0,
          )}
        />
      </View>

      <View position="absolute" w="full" px="2" bottom="2" borderRadius={15}>
        <BasketCreateOrderButton />
      </View>
    </Wrapper>
  );
};

export default BasketPage;
