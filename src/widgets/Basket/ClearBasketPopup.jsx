import { StyleSheet } from "react-native-css-interop";
import { Button, Text, View } from "native-base";
import { Modal, Dimensions, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  closeClearBasketPopup,
  doClearPopupConfirmingAction,
  selectClearBasketPopup,
} from "../../features/store/basket/basketSlice";
import { useTranslation } from "react-i18next";

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Aligns content to the bottom
    backgroundColor: 'transparent', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white', // Your desired background color for the modal
    borderTopLeftRadius: 20, // Optional: for rounded corners
    borderTopRightRadius: 20, // Optional: for rounded corners
    paddingTop: 50,
    paddingBottom: 100,
    gap: 20,
    paddingHorizontal: 10,
  },
};

const ClearBasketPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const popupState = useSelector(selectClearBasketPopup);

  return (
    <Modal visible={popupState.isOpened} transparent={true} animationType="slide">
      <Pressable flex={1} onPress={() => { dispatch((closeClearBasketPopup())) }}>
        <View style={styles.modalOverlay} >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text fontSize="xl" mr="10" fontWeight="bold">
                {t(popupState.text)}
              </Text>
              <View flexDir="row" flex={1} justifyContent="space-between" gap={5}>
                <Button
                  height={12}
                  background="red.600"
                  flex={1}
                  onPress={() => {
                    console.log("HELLO")
                    dispatch(closeClearBasketPopup());
                  }}
                >
                  {t(popupState.cancelButtonText)}
                </Button>
                <Button
                  height={12}
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
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal >
  );
};

export default ClearBasketPopup;
