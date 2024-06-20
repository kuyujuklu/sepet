import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import { styles } from "./navbar.style";

const NavbarLink = ({ to, imageSource, isSelected }) => {
  const navigator = useNavigation();
  const goTo = () => {
    navigator.navigate(to);
  };
  return (
    <TouchableOpacity style={styles.navbarButton} onPress={goTo}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          style={{
            width: isSelected ? "80%" : "60%",
            height: isSelected ? "80%" : "60%",
          }}
          source={imageSource}
          alt="smthng"
        />
      </View>
    </TouchableOpacity>
  );
};

export default NavbarLink;
