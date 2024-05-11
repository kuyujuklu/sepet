import { Animated, Text } from "react-native";
import { styles } from "./navbar.style";
import { useEffect, useState } from "react";
import { Button, View } from "native-base";
import { clearAuthenticationData } from "../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import SwitchLanguage from "./SwitchLanguage";

const NavbarExpandMore = ({ expanded }) => {
  const {t} = useTranslation()
  //from 0 to 1
  const navigator = useNavigation()
  const [expandedSize] = useState(new Animated.Value(0));

  useEffect(() => {
    expandedSize.stopAnimation();
    Animated.timing(expandedSize, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const [heightOfContainer, setHeightOfContainer] = useState(0);

  const logout = () => {
    clearAuthenticationData()
    navigator.navigate("Authentication")
  }
  return (
    <Animated.View
      onLayout={({ nativeEvent }) => {
        setHeightOfContainer(nativeEvent.layout.height);
      }}
      style={{
        ...styles.expandMore(expanded),
        width: expandedSize.interpolate({
          inputRange: [0, 1],
          outputRange: ["0%", "80%"],
        }),
        // padding: expandedSize.interpolate({
        //   inputRange: [0, 1],
        //   outputRange: [0, 20],
        // }),
        padding: expanded ? 20 : 0,
        // height: expandedSize.interpolate({
        //   inputRange: [0, 1],
        //   outputRange: [10, 150],
        // }),
        height: 150,
        top: -150
      }}
    >
      {expanded && (
        <View gap={4}>
          <Button onPress={logout}>{t("auth.logout")}</Button>
          <SwitchLanguage />
        </View>
      )}
    </Animated.View>
  );
};

export default NavbarExpandMore;
