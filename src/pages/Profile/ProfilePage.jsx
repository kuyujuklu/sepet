import { Text, View } from "native-base";
import { Image } from "expo-image";
import { Linking, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import SwitchLanguage from "../../widgets/Profile/SwitchLanguage";
import { images } from "../../app/images/images";
import {
  openDeleteClientPopup,
  selectClient,
} from "../../features/store/auth/authSlice";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { events, track } from "../../shared/analytics/analytics";

const SUPPORT_PHONE = "+373 605 49 995";
const SUPPORT_TELEGRAM = "http://t.me/AlternativeGE";

const ProfileRow = ({ icon, label, hint, onPress }) => (
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
      <View style={{ width: 24, height: 24 }}>
        <Image source={icon} style={{ width: "100%", height: "100%" }} />
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

        {/* Support */}
        <Text px="1" pt="2" fontSize={14} color="coolGray.500">
          {t("profile.support")}
        </Text>

        <ProfileRow
          icon={images.TechSupport}
          label={SUPPORT_PHONE}
          onPress={() => contactSupport("phone", `tel:${SUPPORT_PHONE}`)}
        />

        <ProfileRow
          icon={images.Telegram}
          label="@AlternativeGE"
          onPress={() => contactSupport("telegram", SUPPORT_TELEGRAM)}
        />

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
