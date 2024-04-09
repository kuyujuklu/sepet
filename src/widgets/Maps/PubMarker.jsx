import { Text, View } from "native-base";
import { Marker } from "react-native-maps";

const PubMarker = ({isSelected, lat, lng, name, id, onPress }) => {
  return (
    <Marker
      onPress={onPress}
      coordinate={{
        latitude: lat,
        longitude: lng,
      }}
      zIndex={isSelected ? 100 : 0}
      title={"You are here"}
    >
      <View style={{ minHeight: 6 }}>
        <View
          position={"relative"}
          px="2"
          py="1"
          mb={"2"}
          top={0.5}
          rounded={"lg"}
          bg={"blue.400"}
        >
          <Text fontSize={10}>{name}</Text>
        </View>
        <View
          position={"absolute"}
          bottom={1}
          style={{ alignSelf: "center", transform: "rotate(45deg)" }}
          w={3}
          h={3}
          background={"blue.400"}
          zIndex={-1}
        ></View>
      </View>
    </Marker>
  );
};

export default PubMarker;
