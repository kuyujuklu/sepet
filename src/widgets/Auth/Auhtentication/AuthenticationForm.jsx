import {
  Button,
  Icon,
  KeyboardAvoidingView,
  ScrollView,
  Spinner,
  Text,
  View,
} from "native-base";
import { authStyles } from "../auth.styles";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
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
import { trimPhone } from "../../../shared/utils/phone-utils";
import {
  Animated,
  Dimensions,
  Keyboard,
  Linking,
  Platform,
  TouchableOpacity,
} from "react-native";
import { selectGeolocation } from "../../../features/store/geolocation/geolocationSlice";

const AuthenticationForm = () => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const location = useSelector(selectGeolocation);

  const [
    authenticationQuery,
    {
      data: authenticationQueryData,
      error: authenticationQueryError,
      isLoading: authenticationQueryIsLoading,
    },
  ] = useLazyAuthenticationQuery({});

  const sendAuthentication = async () => {
    authenticationQuery({ phone: trimPhone(phone), password });
  };

  //Handling authentication data sending success
  useEffect(() => {
    if (!authenticationQueryData || !authenticationQueryData.ok) return;

    setaccesstoken(authenticationQueryData.access_token);
    dispatch(enableNavbar());
    dispatch(setRefetchClient(true));
    SecureStore.setItemAsync(
      "refresh_token",
      authenticationQueryData.refresh_token,
    );

    if (location && location.lat && location.lng) {
      navigator.navigate("Home");
      return;
    }

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

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const [height, setHeight] = useState(0);
  const shouldHideImage = Dimensions.get("window").height - height > 50;
  const [animatedHeight] = useState(new Animated.Value(0));
  useEffect(() => {
    animatedHeight.stopAnimation();
    if (height === 0) {
      return;
    }

    Animated.timing(animatedHeight, {
      toValue: shouldHideImage ? 0 : 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [shouldHideImage]);

  const isLoading = authenticationQueryIsLoading;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      flex={1}
    >
      <ScrollView
        flex={1}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height);
        }}
        keyboardShouldPersistTaps={"handled"}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View>
          <View
            flex={1}
            justifyContent="space-around"
            alignItems="center"
            py={10}
          >
            <Animated.View
              style={{
                width: 150,
                height: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150],
                }),
              }}
            >
              <Image
                contentFit="contain"
                source={images.Sepet}
                style={{ width: "100%", height: "100%" }}
              />
            </Animated.View>
          </View>
          <View>
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
              {t("auth.headline")}
            </Text>
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

            <Button
              onPress={() => navigator.navigate("ChangePassword")}
              variant="outline"
              mt={2}
              color="coolGray.600"
            >
              <Text textAlign={"center"} color="coolGray.500">
                {t("auth.go_to_change_password")}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthenticationForm;
