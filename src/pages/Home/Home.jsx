import { Text, View } from "native-base";
import PubsMap from "../../widgets/Maps/PubsMap";
import PubList from "../../widgets/Pub/PubList";
import { useState } from "react";
import FoodCategoriesPlaceholder from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import Wrapper from "../Wrapper";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const [selectedPub, setSelectedPub] = useState(null);

  return (
    <Wrapper>
      <View px="5" pb="5">
        <Text
          fontWeight={"bold"}
          background={"#fff"}
          color="#111"
          fontSize={29}
        >
          {t("home_page.pubs_near_you")}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <PubsMap selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>
      <View mt={3}>
        <PubList selectedPub={selectedPub} selectPub={setSelectedPub} />
      </View>
      <View mt={4} mb="2" px={4}>
        <FoodCategoriesPlaceholder />
      </View>
    </Wrapper>
  );
};

export default Home;
