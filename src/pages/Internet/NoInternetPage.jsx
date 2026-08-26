import { Text, View } from "native-base";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";

// Registered in the stack but never navigated to today - InternetChecker only
// raises an alert. It still has to survive being opened: inside the Wrapper,
// so it is not printed under the status bar.
const NoInternetPage = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <View flex={1} alignItems="center" justifyContent="center" px="8" gap={3}>
        <Text fontSize={20} fontWeight="bold" color="#111" textAlign="center">
          {t("internet.no_internet_title")}
        </Text>
        <Text fontSize={15} color="coolGray.500" textAlign="center">
          {t("internet.no_internet_text")}
        </Text>
      </View>
    </Wrapper>
  );
};

export default NoInternetPage;
