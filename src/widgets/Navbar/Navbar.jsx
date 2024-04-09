import NavbarLink from "./NavbarLink";
import NavbarExpandMore from "./NavbarExpandMore";
import { styles } from "./navbar.style";
import NavbarExpandMoreButton from "./NavbarExpandMoreButton";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectBasket } from "../../features/store/basket/basketSlice";
import { Text, View } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { images } from "../../app/images/images";

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const navigator = useNavigation();

  const basket = useSelector(selectBasket);

  const basketCount = Object.values(basket).reduce(
    (acc, item) => acc + item.count,
    0
  );

  const goToBasket = () => {
    navigator.navigate("Basket");
  };

  return (
    <View style={styles.navbarWrapper}>
      <View style={styles.navbarContainer}>
        <NavbarLink
          imageSource={images.Home}
          to={"Home"}
        />
        <View>
            {(basketCount > 0) && (
                <Pressable 
                zIndex={100}
                onPress={goToBasket}>
                  <View
                      position={"absolute"}
                      top={1}
                      zIndex={100}
                      right={0}
                      height={5}
                      width={5}
                      background={"red.600"}
                      borderRadius={"full"}
                      alignItems={"center"}
                      justifyContent={"center"}
                  >
                      <Text color="white">{basketCount}</Text>
                  </View>
                </Pressable>
            )}
          <NavbarLink
            imageSource={images.Cart}
            to={"Basket"}
          />
        </View>
        <NavbarLink
          imageSource={images.OrderList}
          to={"Orders"}
        />
        <NavbarLink
          imageSource={images.OrderList}
          to={"SelectGeolocationPage"}
        />
        <NavbarExpandMoreButton setExpanded={setExpanded} expanded={expanded} />
      </View>
      <NavbarExpandMore expanded={expanded} />
    </View>
  );
};

export default Navbar;
