import { Button, Icon, Spinner, Text, View } from "native-base";
import { authStyles } from "../auth.styles";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import { useLazyAuthenticationQuery } from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import AuthenticationDataInputs from "./AuthenticationDataInputs";
import { enableNavbar } from "../../../features/store/navbar/navbarSlice";

import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { images } from "../../../app/images/images";
import { setRefetchClient } from "../../../features/store/auth/authSlice";

const AuthenticationForm = () => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [
    authenticationQuery,
    {
      data: authenticationQueryData,
      error: authenticationQueryError,
      isLoading: authenticationQueryIsLoading,
    },
  ] = useLazyAuthenticationQuery({});

  const sendAuthentication = async () => {
    authenticationQuery({ phone, password });
  };

  //Handling authentication data sending success
  useEffect(() => {
    if (!authenticationQueryData || !authenticationQueryData.ok) return;

    setaccesstoken(authenticationQueryData.access_token);
    dispatch(enableNavbar());
    dispatch(setRefetchClient(true))

    SecureStore.setItemAsync(
      "refresh_token",
      authenticationQueryData.refresh_token,
    );
    navigator.navigate("SelectGeolocationPage");
  }, [authenticationQueryData]);

  // Handling authentication data sending error
  useEffect(() => {
    if (!authenticationQueryError?.data || !authenticationQueryError?.data)
      return;

    dispatch(
      pushError({
        errorKey: errorKeys.authentication,
        error: authenticationQueryError.data.err,
      }),
    );
  }, [authenticationQueryError]);

  const isLoading = authenticationQueryIsLoading;

  return (
    <View style={authStyles.authContainer}>
      <View height="40%" style={{aspectRatio: 1}}>

        <Image contentFit="contain" source={images.AllFoodHighQuality} style={{width: "100%", height: "100%"}} />
        
      </View>
      {/* Form */}
      <View style={authStyles.authFormContainer}>
        <AuthenticationDataInputs
          phoneNumber={phone}
          setPhoneNumber={setPhone}
          password={password}
          setPassword={setPassword}
        />

        <Button
          backgroundColor="emerald.600"
          mt="10"
          onPress={sendAuthentication}
          rightIcon={
            isLoading ? (
              <></>
            ) : (
              <Icon size={5} as={Ionicons} name="arrow-forward" />
            )
          }
          color="white"
        >
          {isLoading ? <Spinner color={"white"} /> : t("auth.submit")}
        </Button>

        <Button
          onPress={() => navigator.navigate("Registration")}
          variant="outline"
          mt={2}
          color="coolGray.600"
        >
          <Text textAlign={"center"} color="coolGray.500">
            {t("auth.go_to_registration")}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default AuthenticationForm;
