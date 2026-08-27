import { Text, View } from "native-base";
import { Image, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { selectActiveOrders } from "../../features/store/orders/ordersSlice";
import { images } from "../../app/images/images";
import { Screens } from "../../app/navigation/screens";
import { events, track } from "../../shared/analytics/analytics";

// Shown over the feed instead of BasketFloatingBar while the basket is empty,
// so an order in progress does not disappear from view just because there is
// nothing left to order right now (see BasketFloatingBar, mutually exclusive
// with this one).
const ActiveOrdersFloatingBar = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();

  const activeOrders = useSelector(selectActiveOrders);
  const count = activeOrders.length;

  if (count === 0) return null;

  const goToOrders = () => {
    track(events.activeOrdersBarOpened, { count });

    // One order in progress goes straight to it; more than one goes to the
    // list, same as tapping an order card would
    if (count === 1) {
      navigator.navigate(Screens.OrderInfoPage, { orderID: activeOrders[0].id });
      return;
    }

    navigator.navigate(Screens.Orders);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={goToOrders}>
      <View
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="#1d4ed8"
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
            source={images.OrderList}
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
            {t("home_page.active_orders")}
          </Text>
        </View>

        <Text color="#fff" fontSize={16} fontWeight="bold">
          ›
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ActiveOrdersFloatingBar;
