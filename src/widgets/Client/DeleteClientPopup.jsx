import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  closeDeleteClientPopup,
  selectDeleteClientPopup,
} from "../../features/store/auth/authSlice";
import { Button, Modal, Text, View } from "native-base";
import { useDeleteAccountMutation } from "../../shared/api/client/clientApi";
import { useEffect } from "react";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { pushAlert } from "../../features/store/alerts/alertSlice";
import { setNavbarExpanded } from "../../features/store/navbar/navbarSlice";

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
    <Modal isOpen={popupState.opened} animationPreset="fade">
      <Modal.Content style={{ width: "100%" }}>
        <Modal.Header>
          <Text fontSize="2xl" fontWeight="bold">
            {t("delete_account_popup.headline")}
          </Text>
        </Modal.Header>
        <Modal.CloseButton onPress={() => dispatch(closeDeleteClientPopup())} />
        <Modal.Body>
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
              flex={1}
              minW={120}
              onPress={() => {
                dispatch(closeDeleteClientPopup());
              }}
            >
              {t("delete_account_popup.back")}
            </Button>
            <Button
              background="coolGray.800"
              minW={120}
              onPress={() => {
                deleteAccount();
              }}
            >
              {t("delete_account_popup.delete")}
            </Button>
          </View>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteClientPopup;
