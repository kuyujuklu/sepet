import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BottomSheet, { SheetButton } from "../Common/BottomSheet";
import {
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  selectClearBasketPopup,
} from "../../features/store/basket/basketSlice";

const ClearBasketPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const popupState = useSelector(selectClearBasketPopup);

  const close = () => dispatch(closeClearBasketPopup());

  return (
    <BottomSheet
      id="clearBasket"
      isOpened={popupState.isOpened}
      onClose={close}
      title={t(popupState.text)}
    >
      <View style={{ gap: 10 }}>
        <SheetButton
          tone="danger"
          onPress={() => {
            dispatch(doClearPopupConfirmingAction());
            dispatch(closeClearBasketPopup());
          }}
        >
          {t(popupState.okButtonText)}
        </SheetButton>

        <SheetButton tone="secondary" onPress={close}>
          {t(popupState.cancelButtonText)}
        </SheetButton>
      </View>
    </BottomSheet>
  );
};

export default ClearBasketPopup;
