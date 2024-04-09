import {  Text, View } from "native-base";
import PubsMap from "../../widgets/Maps/PubsMap";
import PubList from "../../widgets/Pub/PubList";
import { useState } from "react";
import FoodCategoriesPlaceholder from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import Wrapper from "../Wrapper";

const Home = () => {
  const [selectedPub, setSelectedPub] = useState(null);

  return (
    <Wrapper>
      <View mb={2} px={4}>
        < FoodCategoriesPlaceholder />
      </View>
      <View px="10">
        <Text
          fontWeight={"bold"}
          background={"#fff"}
          color="#111"
          fontSize={29}
        >
          On the map
        </Text>
      </View>

      <View mb={3}>
        <PubList selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>

      <View style={{ flex: 1  }} >
        <PubsMap selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>
    </Wrapper>
  );
};

export default Home;