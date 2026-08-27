import { Text, View } from "native-base";
import { Image } from "expo-image";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  selectGeolocation,
  selectIsApproximateGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import { images } from "../../app/images/images";
import ProfileButton from "./ProfileButton";
import { getLocationLabel } from "../../shared/utils/geolocation";
import { Screens } from "../../app/navigation/screens";
import { events, track } from "../../shared/analytics/analytics";

const roundButton = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
};

// The single top bar of the app: address on the left, profile on the right.
// There is no bottom tab bar any more, so `showBack` is the only way back
// on the inner screens (every stack screen has headerShown: false).
const AppHeader = ({
  title,
  // Sits right next to the title (e.g. the "about this place" button)
  titleRight,
  showAddress = true,
  showBack = false,
  // Where the back arrow leads when there is nothing to pop - after a deep
  // link or a `navigate` that replaced the stack there often is not.
  // Every screen must have a way out to the first screen of the app.
  fallbackScreen = Screens.Home,
  right,
}) => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const location = useSelector(selectGeolocation);
  const isApproximate = useSelector(selectIsApproximateGeolocation);

  // location can be null on a cold start - never build the string blindly.
  // While it is approximate we print what we do know (street, city, or just
  // "near you") plus a caption saying it came from the geolocation, instead of
  // pretending we have no idea where the client is.
  const label = getLocationLabel(location, t);
  const addressLabel = label ?? t("header.set_address");

  const goBack = () => {
    if (navigator.canGoBack()) {
      navigator.goBack();
      return;
    }

    navigator.navigate(fallbackScreen);
  };

  const goToGeolocation = () => {
    track(events.addressOpened, { has_address: !!label && !isApproximate });
    navigator.navigate(Screens.SelectGeolocationPage);
  };

  return (
    <View px="4" pt="3" pb="2" gap={2} backgroundColor="#f5f5f5">
      <View flexDir="row" alignItems="center" gap={3}>
        {showBack && (
          <TouchableOpacity activeOpacity={0.8} onPress={goBack}>
            <View
              w={10}
              h={10}
              borderRadius="full"
              backgroundColor="#fff"
              alignItems="center"
              justifyContent="center"
              style={roundButton}
            >
              <Text fontSize={20} lineHeight={22} color="#111">
                ←
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View flex={1} justifyContent="center">
          {!!title && (
            <View flexDir="row" alignItems="center" gap={2}>
              <Text
                flexShrink={1}
                fontSize={20}
                fontWeight="bold"
                color="#111"
                numberOfLines={1}
              >
                {title}
              </Text>
              {titleRight}
            </View>
          )}

          {showAddress && (
            <TouchableOpacity activeOpacity={0.7} onPress={goToGeolocation}>
              <View flexDir="row" alignItems="center" gap={1}>
                <View style={{ width: 16, height: 16 }}>
                  <Image
                    source={images.Locaiton}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>

                <View flex={1}>
                  <Text
                    color="emerald.600"
                    fontWeight="medium"
                    fontSize={title ? 14 : 17}
                    numberOfLines={1}
                  >
                    {addressLabel}
                  </Text>

                  {isApproximate && (
                    <Text color="coolGray.500" fontSize={11} numberOfLines={1}>
                      {t("header.approximate_hint")}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {right === undefined ? <ProfileButton /> : right}
      </View>
    </View>
  );
};

export default AppHeader;
