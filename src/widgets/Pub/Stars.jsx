import { Image, View } from "react-native";

const Stars = ({ count }) => {
  return (
    <>
      {!!(+count) && (
        <View style={{ flexDirection: "row", gap: 3 }}>
          {Array.from({ length: count }).map((_, i) => (
            <Image
              key={i}
              width={10}
              height={10}
              source={require("../../../assets/images/star.png")}
              alt="smthng"
              />
          ))}
        </View>
      )}
    </>
  );
};

export default Stars;
