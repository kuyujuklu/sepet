import { View } from "native-base";
import { Image, ScrollView } from "react-native";

const Wrapper = ({ children }) => {
  return (
    <View style={{ paddingTop: 25, flex: 1, gap: 0 }}>
      <View position={"absolute"} width={"100%"} height={"100%"}>
        <Image
          source={require("../../assets/images/bg4.jpeg")}
          alt="smthng"
          contentFit=""
          style={{ width: "100%" }}
        ></Image>
      </View>
      {children}
    </View>
  );
};

export default Wrapper;
