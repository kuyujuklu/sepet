import { Pressable, Text, View } from "native-base";
import { Dimensions } from "react-native";

const NavbarExpandMoreCloseArea = ({ isOpened, closeExpandMore }) => {
  let ScreenHeight = Dimensions.get("window").height;
  let ScreenWidth = Dimensions.get("window").width;
  return (
    <>
      {isOpened && (
        <Pressable
          onPress={closeExpandMore}
          style={{
            position: "absolute",
            width: 1000,
            height: 2000,
            right: 0,
            top: "-2000%",
            zIndex: 80,
          }}
        />
      )}
    </>
  );
};

export default NavbarExpandMoreCloseArea;
