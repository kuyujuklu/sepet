import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, View } from "react-native";
import { styles } from "./navbar.style";

const NavbarLink = ({ to, imageSource }) => {
  const navigator = useNavigation();
  const goTo = () => {
    navigator.navigate(to);
  };
  return (
    <Pressable style={styles.navbarButton} onPress={goTo}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          style={{ width: "60%", height: "60%" }}
          source={imageSource}
          alt="smthng"
        />
      </View>
    </Pressable>
  );
};

export default NavbarLink;
