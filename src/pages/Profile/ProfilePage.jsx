import { Text, View } from "native-base";
import { Image } from "expo-image";
import { ActivityIndicator, Linking, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Screens } from "../../app/navigation/screens";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import SwitchLanguage from "../../widgets/Profile/SwitchLanguage";
import { images } from "../../app/images/images";
import {
  openDeleteClientPopup,
  selectClient,
  setAnalyticsConsent,
} from "../../features/store/auth/authSlice";
import { selectUnreadNotificationsCount } from "../../features/store/notifications/notificationsHistorySlice";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useGetAppSettingsQuery } from "../../shared/api/dictionaries/dictionariesApi";
import { useSetAnalyticsConsentMutation } from "../../shared/api/client/clientApi";
import { events, track } from "../../shared/analytics/analytics";

// Only used until GET /api/client/app-settings answers - changing a support
// number used to need a store release, which is exactly what these were.
const FALLBACK_SUPPORT_PHONE = "+373 605 49 995";
const FALLBACK_SUPPORT_TELEGRAM = "http://t.me/AlternativeGE";

// "@AlternativeGE" out of "http://t.me/AlternativeGE"
const telegramHandle = (url) => {
  const handle = String(url ?? "").split("/").filter(Boolean).pop();

  return handle ? `@${handle}` : "";
};

// `iconNode` is for the rare row with no matching image in assets/images - a
// vector glyph instead, sized to line up with the raster icons around it
const ProfileRow = ({ icon, iconNode, label, hint, badge, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
    <View
      flexDir="row"
      alignItems="center"
      gap={3}
      px="4"
      py="3.5"
      backgroundColor="#fff"
      borderRadius="2xl"
    >
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        {iconNode ?? <Image source={icon} style={{ width: "100%", height: "100%" }} />}
      </View>

      <View flex={1}>
        <Text fontSize={16} color="#111" numberOfLines={1}>
          {label}
        </Text>
        {!!hint && (
          <Text fontSize={13} color="coolGray.500" numberOfLines={1}>
            {hint}
          </Text>
        )}
      </View>

      {!!badge && (
        <View
          minW="5"
          h="5"
          px="1.5"
          borderRadius="full"
          backgroundColor="emerald.600"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={11} fontWeight="bold" color="#fff">
            {badge}
          </Text>
        </View>
      )}

      <Text fontSize={20} color="coolGray.400">
        ›
      </Text>
    </View>
  </TouchableOpacity>
);

// Everything that used to live in the bottom bar's slide-out drawer:
// orders, address, support, language, logout, delete account.
const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const client = useSelector(selectClient);
  const unreadNotificationsCount = useSelector(selectUnreadNotificationsCount);

  const { data: appSettings } = useGetAppSettingsQuery();
  const [saveAnalyticsConsent, { isLoading: isSavingConsent }] =
    useSetAnalyticsConsentMutation();

  const supportPhone = appSettings?.support_phone || FALLBACK_SUPPORT_PHONE;
  const supportTelegram =
    appSettings?.support_telegram || FALLBACK_SUPPORT_TELEGRAM;
  const privacyPolicyUrl = appSettings?.privacy_policy_url;
  const policyVersion = appSettings?.policy_version ?? "";

  const analyticsAccepted = !!client?.analyticsConsent;

  // The record travels with the version of the policy that was on screen, so
  // a later rewrite can ask again instead of inheriting an answer given to a
  // different text
  const toggleAnalyticsConsent = async () => {
    if (isSavingConsent || client?.isGuest) return;

    const accepted = !analyticsAccepted;

    // Optimistic: the switch is the client's own answer, and the request
    // failing must not leave the UI arguing with them
    dispatch(setAnalyticsConsent({ accepted, policyVersion }));

    await saveAnalyticsConsent({ accepted, policyVersion })
      .unwrap()
      .catch(() => {
        dispatch(
          setAnalyticsConsent({
            accepted: analyticsAccepted,
            policyVersion: client?.consentPolicyVersion ?? "",
          }),
        );
      });
  };

  const logout = () => {
    clearAuthenticationData();
    navigator.navigate("Authentication");
  };

  const contactSupport = (channel, url) => {
    track(events.supportContacted, { channel });
    Linking.openURL(url);
  };

  return (
    <Wrapper>
      <AppHeader title={t("profile.title")} showAddress={false} showBack right={null} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
        {/* Who is signed in */}
        <View px="1" pb="1">
          <Text fontSize={14} color="coolGray.500">
            {client?.isGuest || !client?.phone
              ? t("auth.guest_account")
              : `+373${client?.phone}`}
          </Text>
        </View>

        <ProfileRow
          icon={images.OrderList}
          label={t("profile.orders")}
          onPress={() => navigator.navigate("Orders")}
        />

        <ProfileRow
          icon={images.Locaiton}
          label={t("profile.change_address")}
          onPress={() => navigator.navigate("SelectGeolocationPage")}
        />

        {/* Language */}
        <View px="4" py="3.5" backgroundColor="#fff" borderRadius="2xl" gap={3}>
          <Text fontSize={16} color="#111">
            {t("profile.language")}
          </Text>
          <SwitchLanguage />
        </View>

        {/* Additional settings */}
        <Text px="1" pt="2" fontSize={14} color="coolGray.500">
          {t("profile.additional_settings")}
        </Text>

        <ProfileRow
          iconNode={<Ionicons name="notifications-outline" size={22} color="#111" />}
          label={t("profile.notifications")}
          badge={unreadNotificationsCount}
          onPress={() => navigator.navigate(Screens.Notifications)}
        />

        {/* Support */}
        <Text px="1" pt="2" fontSize={14} color="coolGray.500">
          {t("profile.support")}
        </Text>

        <ProfileRow
          icon={images.TechSupport}
          label={supportPhone}
          onPress={() => contactSupport("phone", `tel:${supportPhone}`)}
        />

        <ProfileRow
          icon={images.Telegram}
          label={telegramHandle(supportTelegram)}
          onPress={() => contactSupport("telegram", supportTelegram)}
        />

        {/* Privacy */}
        <Text px="1" pt="2" fontSize={14} color="coolGray.500">
          {t("profile.privacy")}
        </Text>

        {!client?.isGuest && (
          <TouchableOpacity activeOpacity={0.7} onPress={toggleAnalyticsConsent}>
            <View
              flexDir="row"
              alignItems="center"
              gap={3}
              px="4"
              py="3.5"
              backgroundColor="#fff"
              borderRadius="2xl"
            >
              <View flex={1}>
                <Text fontSize={16} color="#111">
                  {t("profile.analytics_consent")}
                </Text>
                <Text fontSize={13} color="coolGray.500">
                  {t("profile.analytics_consent_hint")}
                </Text>
              </View>

              {isSavingConsent ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <View
                  w={12}
                  h={7}
                  borderRadius="full"
                  px="0.5"
                  justifyContent="center"
                  alignItems={analyticsAccepted ? "flex-end" : "flex-start"}
                  backgroundColor={analyticsAccepted ? "emerald.600" : "coolGray.300"}
                >
                  <View w={6} h={6} borderRadius="full" backgroundColor="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {!!privacyPolicyUrl && (
          <ProfileRow
            iconNode={
              <Ionicons name="document-text-outline" size={22} color="#111" />
            }
            label={t("profile.privacy_policy")}
            onPress={() => Linking.openURL(privacyPolicyUrl)}
          />
        )}

        {/* Account actions */}
        <TouchableOpacity activeOpacity={0.8} onPress={logout}>
          <View
            mt="4"
            py="3.5"
            borderRadius="2xl"
            backgroundColor="red.600"
            alignItems="center"
          >
            <Text color="#fff" fontSize={16} fontWeight="medium">
              {t("auth.logout")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => dispatch(openDeleteClientPopup())}
        >
          <View py="4" alignItems="center">
            <Text
              fontSize="xs"
              color="coolGray.500"
              style={{ textDecorationLine: "underline" }}
            >
              {t("auth.go_to_delete_account")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Wrapper>
  );
};

export default ProfilePage;
