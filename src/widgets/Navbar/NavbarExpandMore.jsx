import {
  Animated,
  Pressable,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import { styles } from "./navbar.style";
import { useEffect, useState } from "react";
import { Button, View, Text } from "native-base";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import SwitchLanguage from "./SwitchLanguage";
import { images } from "../../app/images/images";
import { useSelector } from "react-redux";
import { selectClient } from "../../features/store/auth/authSlice";

const NavbarExpandMore = ({ expanded, setExpanded }) => {
  const { t } = useTranslation();
  //from 0 to 1
  const navigator = useNavigation();
  const [expandedSize] = useState(new Animated.Value(0));
  const client = useSelector(selectClient);

  useEffect(() => {
    expandedSize.stopAnimation();
    Animated.timing(expandedSize, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  // const [heightOfContainer, setHeightOfContainer] = useState(0);

  const logout = () => {
    setExpanded(false);
    clearAuthenticationData();
    navigator.navigate("Authentication");
  };

  const goToSelectGeolocation = () => {
    setExpanded(false);
    navigator.navigate("SelectGeolocationPage");
  };

  return (
    <Animated.View
      // onLayout={({ nativeEvent }) => {
      //   setHeightOfContainer(nativeEvent.layout.height);
      // }}
      style={{
        ...styles.expandMore(expanded),
        width: "70%",
        right: expandedSize.interpolate({
          inputRange: [0, 1],
          outputRange: ["-100%", "0%"],
        }),
        padding: 20,
        height: 260,
        top: -260,
        zIndex: 100,
      }}
    >
      <View gap={4}>
        <View flexDir="row">
          <SwitchLanguage />
        </View>

        <View gap={1}>
          <TouchableOpacity
            onPress={() => {
              goToSelectGeolocation()
            }}
          >
            <View mb={2} flexDir="row" gap={2} alignItems="center">
              <View style={{ height: 30, width: 30 }}>
                <Image
                  style={{ height: 30, width: 30 }}
                  source={images.Locaiton}
                />
              </View>

              <Text color="emerald.600" style={{ fontSize: 16, fontWeight: "medium" }}>
                {t("select_geolocation.change_geolocation")}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`tel:+373 605 49 995`);
            }}
          >
            <View flexDir="row" gap={2} alignItems="center">
              <View style={{ height: 30, width: 30 }}>
                <Image
                  style={{ height: 30, width: 30 }}
                  source={images.TechSupport}
                />
              </View>

              <Text  color="emerald.600"style={{ fontSize: 16, fontWeight: "medium" }}>
                +373 605 49 995
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`http://t.me/AlternativeGE`);
            }}
          >
            <View flexDir="row" gap={2} alignItems="center">
              <View style={{ height: 30, width: 30 }}>
                <Image
                  style={{ height: 30, width: 30 }}
                  source={images.Telegram}
                />
              </View>

              <Text color="emerald.600" style={{ fontSize: 16, fontWeight: "medium" }}>
                @AlternativeGE
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Button backgroundColor="red.600" h={10} onPress={logout}>
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            <Text>{t("auth.logout")}</Text>
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            +373{client?.phone}
          </Text>
        </Button>
      </View>
    </Animated.View>
  );
};

export default NavbarExpandMore;
