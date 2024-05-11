import { Button, Modal, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  selectClearBasketPopup,
} from "../../features/store/basket/basketSlice";

const ClearBasketPopup = () => {
  const dispatch = useDispatch();
  const popupState = useSelector(selectClearBasketPopup);

  return (
    <Modal isOpen={popupState.isOpened} animationPreset="fade">
      <Modal.Content>
        <Modal.Header py={10}>
          <Text fontSize={"xl"} mr={"10"} fontWeight={"bold"}>
            {popupState.text}
          </Text>
        </Modal.Header>
        <Modal.CloseButton onPress={() => dispatch(closeClearBasketPopup())} />
        <Modal.Body>
          <Button
            background={"emerald.600"}
            onPress={() => {
              dispatch(doClearPopupConfirmingAction());
              dispatch(closeClearBasketPopup());
            }}
          >
            {popupState.buttonText}
          </Button>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default ClearBasketPopup;
