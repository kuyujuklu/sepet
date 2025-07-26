import { Modal, Pressable } from "react-native"
import { Button, Text, View } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  closeDishImagePopup,
} from "../../features/store/dishes/dishesSlice";
import { closePubNotAvailableForDeliveryPopup, selectPubNotAvailableForDeliveryPopup } from "../../features/store/pubs/pubsSlice";
import { useNavigation } from "@react-navigation/native";
import { setPath } from "../../features/store/linking/linkingSlice";

const addCommissionToPrice = (price, commission) => {
  return price + (price / 100) * commission;
};

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
    paddingBottom: 50,
    gap: 20,
    paddingHorizontal: 10,
  },
};

const PubNotAvailableForDeliveryPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const popupState = useSelector(selectPubNotAvailableForDeliveryPopup);
  const navigator = useNavigation();

  return (
    <Modal visible={popupState.isOpened} backdropColor="transparent" animationType="fade">
      <Pressable flex={1} onPress={() => dispatch((closePubNotAvailableForDeliveryPopup()))}>
        <View style={styles.modalOverlay} >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View>
                <Text fontSize="xl" fontWeight="bold" mr="6">
                  {t("pub_not_available_for_delivery.pub_is_not_open")}😞
                </Text>
              </View>
              <View>
                <View flexDir="column" gap={2}>
                  <Button
                    background="emerald.600"
                    minW={120}
                    onPress={() => {
                      dispatch(setPath("Home"))
                      dispatch(closePubNotAvailableForDeliveryPopup())
                      dispatch(closeDishImagePopup())
                      navigator.navigate("Home")
                    }}
                  >
                    {t("pub_not_available_for_delivery.choose_another_pub")}
                  </Button>
                  <Button
                    background="emerald.600"
                    minW={120}
                    onPress={() => {
                      dispatch(setPath("Home"))
                      dispatch(closePubNotAvailableForDeliveryPopup())
                      dispatch(closeDishImagePopup())
                      navigator.navigate("SelectGeolocationPage")
                    }}
                  >
                    {t("pub_not_available_for_delivery.change_geolocation")}
                  </Button>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default PubNotAvailableForDeliveryPopup;

