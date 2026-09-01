import { useMemo } from "react";
import { View } from "native-base";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import CreateOrder from "../../widgets/Orders/CreateOrder/CreateOrder";
import { RowsSkeleton } from "../../widgets/Skeletons/Skeleton";
import { selectBasket } from "../../features/store/basket/basketSlice";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { usePubInfo } from "../../shared/hooks/usePubInfo";
import { getCurrencySymbol } from "../../shared/utils/dish";

const CreateOrderPage = ({ route }) => {
  const { t } = useTranslation();

  const shippingTimeFrom = route?.params?.shippingTimeFrom;
  const shippingTimeTo = route?.params?.shippingTimeTo;
  const pubID = route?.params?.pubID;

  const basket = useSelector(selectBasket);
  const location = useSelector(selectGeolocation);

  // Coordinates go with the request, so the shipping prices and the minimum
  // ride on the pub itself - the nearby-pubs response is no longer needed here
  const { data: pubData, isLoading: isPubLoading } = usePubInfo({ pubID });

  const pub = pubData?.pub;
  const currency = getCurrencySymbol(pub?.currency_id);

  const items = useMemo(() => {
    if (!pubData?.dishes) return [];

    return pubData.dishes
      .filter((dish) => +basket?.[dish.id]?.count > 0)
      .map((dish) => ({ dish, item: basket[dish.id] }));
  }, [pubData, basket]);

  return (
    <Wrapper>
      <AppHeader
        showBack
        showAddress={false}
        right={null}
        title={t("create_order_page.headline")}
      />

      {isPubLoading || !pubData ? (
        <View pt="3">
          <RowsSkeleton count={4} thumbSize={56} />
        </View>
      ) : (
        <View flex={1}>
          <CreateOrder
            location={location}
            basket={basket}
            items={items}
            pub={pub}
            pubID={pubID}
            currency={currency}
            shippingTimeFrom={shippingTimeFrom}
            shippingTimeTo={shippingTimeTo}
          />
        </View>
      )}
    </Wrapper>
  );
};

export default CreateOrderPage;
