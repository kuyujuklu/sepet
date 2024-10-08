import { Image } from "expo-image";
import { View } from "native-base";
import { Platform, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { selectNavbarIsEnabled } from "../features/store/navbar/navbarSlice";

const Wrapper = ({ children, style }) => {
  const isNavbarOpened = useSelector(selectNavbarIsEnabled)

  return (
    <View
      style={{
        paddingTop: Platform.OS === "ios" ? 30 : 0,
        paddingBottom: isNavbarOpened ? (Platform.OS === "ios" ? 75 : 60) : 0,
        // paddingHorizontal: Platform.OS === "ios" ? 10 : 0,
        flex: 1,
        gap: 0,
        backgroundColor: "#f5f5f5",
        zIndex: 1,
        ...style,
      }}
    >
      {children}
    </View>
  );
};

export default Wrapper;
