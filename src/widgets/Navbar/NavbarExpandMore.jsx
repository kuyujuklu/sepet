import { Animated, Pressable, Text, Image } from "react-native";
import { styles } from "./navbar.style";
import { useEffect, useState } from "react";
import { Button, View } from "native-base";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import SwitchLanguage from "./SwitchLanguage";
import { images } from "../../app/images/images";

const NavbarExpandMore = ({ expanded, setExpanded }) => {
  const { t } = useTranslation();
  //from 0 to 1
  const navigator = useNavigation();
  const [expandedSize] = useState(new Animated.Value(0));

  useEffect(() => {
    expandedSize.stopAnimation();
    Animated.timing(expandedSize, {
      toValue: expanded ? 1 : 0,
      duration: 200,
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
        width: expandedSize.interpolate({
          inputRange: [0, 1],
          outputRange: ["0%", "60%"],
        }),
        padding: expanded ? 20 : 0,
        height: 200,
        top: -200,
      }}
    >
      {expanded && (
        <View gap={4}>
          <SwitchLanguage />
          <Pressable
            style={{
              width: 50,
              height: 50,
            }}
            onPress={goToSelectGeolocation}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                style={{
                  width: "60%",
                  height: "60%",
                }}
                source={images.Locaiton}
                alt="smthng"
              />
            </View>
          </Pressable>
          <Button onPress={logout}>{t("auth.logout")}</Button>
        </View>
      )}
    </Animated.View>
  );
};

export default NavbarExpandMore;
