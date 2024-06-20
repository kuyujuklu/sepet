import { Button, Modal, Text, View } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  selectClearBasketPopup,
} from "../../features/store/basket/basketSlice";
import { useTranslation } from "react-i18next";

const ClearBasketPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const popupState = useSelector(selectClearBasketPopup);

  return (
    <Modal isOpen={popupState.isOpened} animationPreset="fade">
      <Modal.Content>
        <Modal.Header py={10}>
          <Text fontSize="xl" mr="10" fontWeight="bold">
            {t(popupState.text)}
          </Text>
        </Modal.Header>
        <Modal.CloseButton onPress={() => dispatch(closeClearBasketPopup())} />
        <Modal.Body>
          <View flexDir="row" flex={1} justifyContent="space-between" gap={5}>
            <Button
              background="red.600"
              flex={1}
              onPress={() => {
                dispatch(closeClearBasketPopup());
              }}
            >
              {t(popupState.cancelButtonText)}
            </Button>
            <Button
              background="emerald.600"
              flex={1}
              onPress={() => {
                dispatch(doClearPopupConfirmingAction());
                dispatch(closeClearBasketPopup());
              }}
            >
              {t(popupState.okButtonText)}
            </Button>
          </View>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default ClearBasketPopup;
