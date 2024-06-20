import { View } from "react-native";
import {Image} from "expo-image"
const Stars = ({ count }) => {
  return (
    <>
      {!!+count && (
        <View style={{ flexDirection: "row", gap: 3 }}>
          {Array.from({ length: count }).map((_, i) => (
            <View style={{ width: 18, height: 18 }}>
              <Image
                key={i}
                width={"100%"}
                height={"100%"}
                source={require("../../../assets/images/star.png")}
                alt="smthng"
              />
            </View>
          ))}
        </View>
      )}
    </>
  );
};

export default Stars;
