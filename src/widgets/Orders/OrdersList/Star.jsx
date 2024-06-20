import { Image } from "expo-image";
import { View } from "native-base";
import { images } from "../../../app/images/images";

const Star = ({empty}) => {
  return (
    <View style={{ width: 20, height: 20 }}>
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
