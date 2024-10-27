import { CommonActions, useNavigation } from "@react-navigation/native";
import { Button } from "native-base";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setClient } from "../../features/store/auth/authSlice";
import { disableNavbar } from "../../features/store/navbar/navbarSlice";

const BasketGoToRegistrationButton = ({}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const navigator = useNavigation();

  const handleButtonPress = () => {
    dispatch(disableNavbar())
    dispatch(setClient({ phone: "", name: "", isGuest: false }));
    navigator.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Registration" }],
      }),
    );
  };

  return (
    <Button
      background={"emerald.600"}
      borderRadius={15}
      onPress={handleButtonPress}
    >
      {t("basket_page.go_to_registration")}
    </Button>
  );
};

export default BasketGoToRegistrationButton;
