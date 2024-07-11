import { Image } from "expo-image";
import { View } from "native-base";
import { ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { selectNavbarIsEnabled } from "../features/store/navbar/navbarSlice";

const Wrapper = ({ children, style }) => {
  const isNavbarOpened = useSelector(selectNavbarIsEnabled)

  return (
    <View
      style={{
        paddingTop: 5,
        paddingBottom: isNavbarOpened ? 50 : 10,
        flex: 1,
        gap: 0,
        backgroundColor: "#f5f5f5",
        ...style,
      }}
    >
      <View position={"absolute"} width={"100%"} height={"100%"}>
        
      </View>
      {children}
    </View>
  );
};

export default Wrapper;
