import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { SheetButton } from "../Common/BottomSheet";
import {
  closeDeleteClientPopup,
  selectDeleteClientPopup,
} from "../../features/store/auth/authSlice";
import { useDeleteAccountMutation } from "../../shared/api/client/clientApi";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { pushAlert } from "../../features/store/alerts/alertSlice";

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 20, color: "#52525b" },
  warning: { fontSize: 14, fontWeight: "bold", color: "#dc2626", marginTop: 12 },
  buttons: { gap: 10, marginTop: 20 },
});

const DeleteClientPopup = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const { t } = useTranslation();

  const popupState = useSelector(selectDeleteClientPopup);

  const [deleteAccount, { data: deleteAccountData, error: deleteAccountError }] =
    useDeleteAccountMutation();

  const logout = () => {
    clearAuthenticationData();
    navigator.navigate("Authentication");
  };

  useEffect(() => {
    if (!deleteAccountData?.ok) return;

    logout();
    dispatch(closeDeleteClientPopup());
  }, [deleteAccountData]);

  useEffect(() => {
    if (!deleteAccountError?.text) return;

    dispatch(
      pushAlert({
        title: t(deleteAccountError.text),
        status: "error",
        delay: 3000,
      }),
    );
  }, [deleteAccountError]);

  return (
    <BottomSheet
      id="deleteClient"
      isOpened={popupState.opened}
      onClose={() => dispatch(closeDeleteClientPopup())}
      title={t("delete_account_popup.headline")}
      scrollable
    >
      <Text style={styles.text}>{t("delete_account_popup.main_text")}</Text>
      <Text style={styles.warning}>
        {t("delete_account_popup.subscription")}
      </Text>

      <View style={styles.buttons}>
        <SheetButton
          tone="secondary"
          onPress={() => dispatch(closeDeleteClientPopup())}
        >
          {t("delete_account_popup.back")}
        </SheetButton>

        <SheetButton tone="danger" onPress={() => deleteAccount()}>
          {t("delete_account_popup.delete")}
        </SheetButton>
      </View>
    </BottomSheet>
  );
};

export default DeleteClientPopup;
