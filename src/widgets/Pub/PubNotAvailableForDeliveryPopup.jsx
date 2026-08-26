import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { SheetButton } from "../Common/BottomSheet";
import { closeDishImagePopup } from "../../features/store/dishes/dishesSlice";
import {
  closePubNotAvailableForDeliveryPopup,
  selectPubNotAvailableForDeliveryPopup,
} from "../../features/store/pubs/pubsSlice";
import { setPath } from "../../features/store/linking/linkingSlice";

const PubNotAvailableForDeliveryPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigator = useNavigation();

  const popupState = useSelector(selectPubNotAvailableForDeliveryPopup);

  const close = () => dispatch(closePubNotAvailableForDeliveryPopup());

  const goTo = (screen) => {
    dispatch(setPath("Home"));
    dispatch(closePubNotAvailableForDeliveryPopup());
    dispatch(closeDishImagePopup());
    navigator.navigate(screen);
  };

  return (
    <BottomSheet
      isOpened={popupState.isOpened}
      onClose={close}
      title={t("pub_not_available_for_delivery.title")}
      subtitle={t("pub_not_available_for_delivery.pub_is_not_open")}
    >
      <View style={{ gap: 10 }}>
        <SheetButton onPress={() => goTo("Home")}>
          {t("pub_not_available_for_delivery.choose_another_pub")}
        </SheetButton>

        <SheetButton
          tone="secondary"
          onPress={() => goTo("SelectGeolocationPage")}
        >
          {t("pub_not_available_for_delivery.change_geolocation")}
        </SheetButton>
      </View>
    </BottomSheet>
  );
};

export default PubNotAvailableForDeliveryPopup;
