import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  closeDeleteClientPopup,
  selectDeleteClientPopup,
} from "../../features/store/auth/authSlice";
import { Button, Text, View } from "native-base";
import { Modal, Pressable } from "react-native";
import { useDeleteAccountMutation } from "../../shared/api/client/clientApi";
import { useEffect } from "react";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { pushAlert } from "../../features/store/alerts/alertSlice";
import { setNavbarExpanded } from "../../features/store/navbar/navbarSlice";

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

const DeleteClientPopup = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const { t } = useTranslation();
  const popupState = useSelector(selectDeleteClientPopup);
  console.log("POPUP STATE", popupState);
  const [
    deleteAccount,
    { data: deleteAccountData, error: deleteAccountError, isLoading },
  ] = useDeleteAccountMutation();

  const logout = () => {
    clearAuthenticationData();
    navigator.navigate("Authentication");
  };

  useEffect(() => {
    if (!deleteAccountData) return;
    if (deleteAccountData && deleteAccountData.ok) {
      logout();
      dispatch(closeDeleteClientPopup());
      dispatch(setNavbarExpanded(false));
    }
  }, [deleteAccountData]);

  useEffect(() => {
    if (!deleteAccountError) return;
    if (deleteAccountError) {
      console.log("del acc eerrrror: ", deleteAccountError);
      if (deleteAccountError.text) {
        dispatch(
          pushAlert({
            title: t(deleteAccountError.text),
            status: "error",
            delay: 3000,
          }),
        );
      }
    }
  }, [deleteAccountError]);

  return (
    <Modal visible={popupState.opened} backdropColor="transparent" animationType="slide">
      <Pressable flex={1} onPress={() => dispatch((closeDeleteClientPopup()))}>
        <View style={styles.modalOverlay} >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View>
                <Text fontSize="2xl" fontWeight="bold">
                  {t("delete_account_popup.headline")}
                </Text>
              </View>
              <View>
                <View
                  rounded="2xl"
                  style={{
                    overflow: "hidden",
                    borderRadius: 26,
                    alignItems: "center",
                    justifyContent: "center",
                    maxHeight: 500,
                    width: "100%",
                  }}
                >
                  <Text fontSize="lg" mt={2}>
                    {t("delete_account_popup.main_text")}
                  </Text>
                  <Text fontSize="lg" w="full" textAlign="left" mt={3} pb={3}>
                    {t("delete_account_popup.headline")}
                  </Text>
                </View>
                <View
                  flex={1}
                  flexDir="row"
                  justifyContent="space-between"
                  mt="5"
                  gap={5}
                >
                  <Button
                    background="red.600"
                    height={12}
                    flex={1}
                    minW={120}
                    onPress={() => {
                      dispatch(closeDeleteClientPopup());
                    }}
                  >
                    {t("delete_account_popup.back")}
                  </Button>
                  <Button
                    height={12}
                    background="coolGray.800"
                    minW={120}
                    onPress={() => {
                      deleteAccount();
                    }}
                  >
                    {t("delete_account_popup.delete")}
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

export default DeleteClientPopup;
