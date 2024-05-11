import { Button, Icon, Spinner, Text, View } from "native-base";
import { authStyles } from "../auth.styles";
import RegistrationDataInputs from "./RegistrationDataInputs";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useLazyRegistrateQuery } from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import { enableNavbar } from "../../../features/store/navbar/navbarSlice";
import { useTranslation } from "react-i18next";
import { ENV } from "../../../constants/env/env";
import { validateRegistrationData } from "../../../shared/validation/validators/client/client-validation";

const RegistrationForm = () => {
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const dispatch = useDispatch();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [
    registrationQuery,
    {
      data: registrationQueryData,
      error: registrationQueryError,
      isLoading: registrationQueryIsLoading,
    },
  ] = useLazyRegistrateQuery({ sessionId: timestampRef });

  const sendRegistration = async () => {
    const registrationData = {
      phone,
      name,
      password,
      repeatPassword
    };
    const validationError = validateRegistrationData(registrationData);
    if (validationError) {
      return;
    }


    registrationQuery({phone, name, password});
  };

  //Handling registration data sending success
  useEffect(() => {
    if (!registrationQueryData || !registrationQueryData.ok) return;

    SecureStore.setItemAsync(
      "refresh_token",
      registrationQueryData.refresh_token,
    );

    setaccesstoken(registrationQueryData.access_token);
    dispatch(enableNavbar());
    navigator.navigate("SelectGeolocationPage");
  }, [registrationQueryData]);

  // // Handling registration data sending error
  useEffect(() => {
    if (!registrationQueryError?.data || !registrationQueryError?.data?.err)
      return;

    dispatch(
      pushError({
        errorKey: errorKeys.registration,
        error: registrationQueryError.data.err,
      }),
    );
  }, [registrationQueryError]);

  const isLoading = registrationQueryIsLoading;

  return (
    <View style={authStyles.authContainer}>
      <Text style={authStyles.authHeadline}>{t("registration.headline")}</Text>
      {/* Form */}
      <View style={authStyles.authFormContainer}>
        <RegistrationDataInputs
          phoneNumber={phone}
          setPhoneNumber={setPhone}
          name={name}
          setName={setName}
          password={password}
          setPassword={setPassword}
          repeatPassword={repeatPassword}
          setRepeatPassword={setRepeatPassword}
        />

        <Button
          primary
          mt={"10"}
          onPress={sendRegistration}
          rightIcon={
            isLoading ? (
              <></>
            ) : (
              <Icon size={5} as={Ionicons} name="arrow-forward" />
            )
          }
          color="white"
        >
          {isLoading ? <Spinner color={"white"} /> : t("registration.submit")}
        </Button>

        <Button
          onPress={() => navigator.navigate("Authentication")}
          variant="outline"
          mt={2}
          color="coolGray.600"
        >
          <Text color="coolGray.500" textAlign={"center"}>
            {t("registration.go_to_auth")}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default RegistrationForm;
