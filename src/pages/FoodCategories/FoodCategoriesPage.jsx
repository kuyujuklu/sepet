import Wrapper from "../Wrapper";
import FoodCategoriesPlaceholder from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import { Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import CategoryWithPubInfoList from "../../widgets/FoodCategories/CategoriesList/CategoryWithPubInfoList";
import { useNavigation } from "@react-navigation/native";

const FoodCategoriesPage = ({ route }) => {
  const foodFilter = route?.params?.foodCategory ?? "";
  const navigator = useNavigation();

  return (
    <Wrapper>
      <FoodCategoriesPlaceholder selectedCategory={foodFilter} />

      <View alignItems={"center"} mt={6}>
        <Text fontFamily={AnonymousProBold} fontSize={32}>
          Near categories
        </Text>
      </View>

      <View flex={1} mt={5}>
        <CategoryWithPubInfoList
          selectCategory={(category) =>
            navigator.navigate("PubInfo", {
              screen: "PubInfo/Categories",
              params: {
                categoryID: category?.id,
              },
              pubID: category?.pub_id,
              selectedMenu: category?.menu_id,
            })
          }
          foodFilter={foodFilter}
        />
      </View>
    </Wrapper>
  );
};

export default FoodCategoriesPage;
