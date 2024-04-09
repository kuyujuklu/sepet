import { Image, Pressable, Text, View } from "react-native";
import { styles } from "./navbar.style";

const NavbarExpandMoreButton = ({ expanded, setExpanded }) => {
  return (
    <Pressable
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
    </Pressable>
  );
};

export default NavbarExpandMoreButton;
