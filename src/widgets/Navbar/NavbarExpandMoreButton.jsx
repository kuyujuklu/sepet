import { Image, TouchableOpacity, View } from "react-native";
import { styles } from "./navbar.style";

const NavbarExpandMoreButton = ({ expanded, setExpanded }) => {
  return (
    <TouchableOpacity
      style={styles.navbarButton}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          style={{ width: "60%", height: "60%" }}
          source={require("../../../assets/images/expand-more.png")}
          alt="smthng"
        />
      </View>
    </TouchableOpacity>
  );
};

export default NavbarExpandMoreButton;
