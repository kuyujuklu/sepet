import { Image } from "expo-image";
import { View } from "react-native";
import { images } from "../../../app/images/images";

const Star = ({ empty, size = 20 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        width={"100%"}
        height={"100%"}
        source={empty ? images.StarEmpty : images.StarFilled}
        alt="smthng"
      />
    </View>
  );
};

export default Star;
