import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BottomSheet, { SheetButton } from "../Common/BottomSheet";
import {
  closeRemoveDishPopup,
  removeDish,
  selectRemoveDishPopup,
} from "../../features/store/basket/basketSlice";

// Confirmation before the last unit of a position leaves the basket.
// Mounted once in App.js like the other global popups and opened from redux.
const RemoveDishPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const popup = useSelector(selectRemoveDishPopup);

  const close = () => dispatch(closeRemoveDishPopup());

  return (
    <BottomSheet
      id="removeDish"
      isOpened={popup.isOpened}
      onClose={close}
      title={t("basket_page.remove_dish.title")}
      subtitle={popup.dishName}
    >
      <View style={{ gap: 10 }}>
        <SheetButton
          tone="danger"
          onPress={() => {
            dispatch(removeDish({ id: popup.dishID }));
            dispatch(closeRemoveDishPopup());
          }}
        >
          {t("basket_page.remove_dish.confirm")}
        </SheetButton>

        <SheetButton tone="secondary" onPress={close}>
          {t("basket_page.remove_dish.cancel")}
        </SheetButton>
      </View>
    </BottomSheet>
  );
};

export default RemoveDishPopup;
