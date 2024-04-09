import { Image, View } from "native-base";
import { ScrollView } from "react-native";

const Wrapper = ({ children }) => {
    return (
        <View style={{ paddingVertical: 10, flex: 1, gap: 0 }}>
            <View position={"absolute"} width={"100%"} height={"100%"}>
                <Image
                    source={require("../../assets/images/bg_image.png")}
                    resizeMode="cover"
                    alt="smthng"
                    style={{ width: "100%" }}
                ></Image>
            </View>
            {children}
        </View>
    );
};

export default Wrapper;
