import { Text, View } from "native-base";
import { useEffect } from "react";
import { Linking, Platform, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { disableNavbar, enableNavbar } from "../../features/store/navbar/navbarSlice";
import { selectIsVersionExpired } from "../../features/store/version/versionSlice";
import { useTranslation } from "react-i18next";
import { images } from "../../app/images/images";

const androidLink = "https://play.google.com/store/apps/details?id=com.camelapp.app";
const iosLink = "https://apps.apple.com/us/app/sepet/id6736594340";

const ExpiredVersionPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isVersionExpired = useSelector(selectIsVersionExpired)

  useEffect(() => {
    if (isVersionExpired) {
      dispatch(disableNavbar())
      return;
    }
  }, [dispatch])

  const handleButtonPress = () => {
    const link = Platform.OS === "ios" ? iosLink : androidLink;

    Linking.canOpenURL(link).then(supported => {
      supported && Linking.openURL(link);
    }, (err) => console.log(err));
  }

  return (
    <View flex={1} justifyContent="space-around">
      <View px="5" pb="5">
        <Text
          fontWeight={"bold"}
          background={"#fff"}
          color="#111"
          fontSize={29}
        >
          {t("version.version_expired_message")}
        </Text>
      </View>
      <View style={{ width: "90%", aspectRatio: 1 / 1, marginLeft: "auto", marginRight: "auto", maxHeight: 400 }}>
        <Image
          style={{ width: "100%", height: "100%" }}
          source={images.BrokenCable}
          contentFit="scale-down"
          alt="WTF"
        />
      </View>
      <TouchableOpacity onPress={handleButtonPress}>
        <View backgroundColor="emerald.600" px="10" py="3" mx="10" rounded="3xl">
          <Text color="white" textAlign="center">
            {t("version.update")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>

  )
};

export default ExpiredVersionPage;
