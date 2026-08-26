import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import OrderInfo from "../../widgets/Orders/OrdersList/OrderInfo";
import { Screens } from "../../app/navigation/screens";

const OrderInfoPage = ({ route }) => {
  const { t } = useTranslation();

  const orderID = route?.params?.orderID;

  return (
    <Wrapper>
      {/* Reachable from a push notification, so `goBack` can have nothing to
          pop - the list of orders is the right place to land then */}
      <AppHeader
        showBack
        showAddress={false}
        right={null}
        fallbackScreen={Screens.Orders}
        title={`${t("order_info_page.order")} №${orderID}`}
      />

      <OrderInfo orderID={orderID} />
    </Wrapper>
  );
};

export default OrderInfoPage;
