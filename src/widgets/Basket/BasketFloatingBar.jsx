import { Text, View } from "native-base";
import { Image, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import {
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { formatPrice, getCurrencySymbol } from "../../shared/utils/dish";
import { getBasketCount, getBasketItemsPrice } from "../../shared/utils/basket";
import { images } from "../../app/images/images";
import { events, track } from "../../shared/analytics/analytics";

// Shortcut to the basket, shown over the feed as soon as something is added.
// With no tab bar, this is the only way into a non-empty basket from Home.
const BasketFloatingBar = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();

  const basket = useSelector(selectBasket);
  const pubID = useSelector(selectBasketPubID);

  const { data: pubData } = useGetPubInfoQuery({ pubID }, { skip: !pubID });

  const count = getBasketCount(basket);

  if (count === 0) return null;

  // Exactly the same math as the basket and the checkout screens
  const itemsPrice = getBasketItemsPrice(basket, pubData?.pub);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        track(events.basketOpened, { source: "floating_bar", count });
        navigator.navigate("Basket");
      }}
    >
      <View
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="emerald.600"
        borderRadius="full"
        pl="5"
        pr="4"
        py="3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View flexDir="row" alignItems="center" gap={2}>
          <Image
            source={images.Cart}
            style={{ width: 20, height: 20, tintColor: "#fff" }}
          />
          <View
            minW={5}
            h={5}
            px="1"
            borderRadius="full"
            backgroundColor="#ffffff33"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="#fff" fontSize={12} fontWeight="bold">
              {count}
            </Text>
          </View>
          <Text color="#fff" fontSize={15} fontWeight="medium">
            {t("home_page.top_dishes.go_to_basket")}
          </Text>
        </View>

        <Text color="#fff" fontSize={16} fontWeight="bold">
          {formatPrice(itemsPrice)}{" "}
          {getCurrencySymbol(pubData?.pub?.currency_id)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BasketFloatingBar;
