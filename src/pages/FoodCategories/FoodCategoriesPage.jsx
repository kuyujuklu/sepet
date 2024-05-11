import Wrapper from "../Wrapper";
import FoodCategoriesPlaceholder from "../../widgets/FoodCategories/CategoriesNavbar/FoodCategoriesNavbar";
import { Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import CategoryWithPubInfoList from "../../widgets/FoodCategories/CategoriesList/CategoryWithPubInfoList";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const FoodCategoriesPage = ({ route }) => {
  const { t } = useTranslation();
  const foodFilter = route?.params?.foodCategory ?? "";
  const navigator = useNavigation();

  return (
    <Wrapper>
      <View mt={5}>
        <FoodCategoriesPlaceholder selectedCategory={foodFilter} />
      </View>

      <View flex={1} alignItems="center" mt={5}>
        <Text fontFamily={AnonymousProBold} fontSize={32} mb="3">
          {t("near_categories_page.headline")}
        </Text>
        <View flex={1}>
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
      </View>
    </Wrapper>
  );
};

export default FoodCategoriesPage;
