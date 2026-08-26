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
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import {
  useLazyAuthenticationQuery,
  useLazyChangePasswordWithValidationNumberQuery,
  useLazyCheckValidationNumbersQuery,
  useLazyGenerateChangePasswordSessionQuery,
} from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";

import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { images } from "../../../app/images/images";
import { setRefetchClient } from "../../../features/store/auth/authSlice";
import AuthValidationNumber from "../AuthValidationNumber";
import ChangePasswordPhoneInput from "./ChangePasswordPhoneInput";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import { convertRespError } from "../../../app/errors/convertApiErrors";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import { validatePhoneNumber } from "../../../shared/validation/validators/order/order-validator";
import ChangePasswordNewPasswordInput from "./ChangePasswordNewPasswordInput";
import { trimPhone } from "../../../shared/utils/phone-utils";
import { Animated, Dimensions, Platform } from "react-native";

const ChangePasswordForm = () => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [page, setPage] = useState("phone"); //data or validation

  const [
    generateChangePasswordSession,
    {
      data: generateSessionData,
      isLoading: isGenerateSessionLoading,
      error: generateSessionError,
    },
  ] = useLazyGenerateChangePasswordSessionQuery();

  useEffect(() => {
    if (!generateSessionData) return;
    setPage("validation");
    setNextSessionTime(generateSessionData.next_session_time);
  }, [generateSessionData]);

  useEffect(() => {
    if (!generateSessionError) return;
    console.log(generateSessionError);
    const errorText = convertRespError(generateSessionError?.data?.err);

    dispatch(
      pushAlert({
        title: t(errorText),
        status: alertStatuses.error,
        delay: 4000,
      }),
    );
    setNextSessionTime(null);
  }, [generateSessionError]);

  const [
    checkValidationNumberQuery,
    {
      data: checkValidationNumberData,
      isLoading: checkValidationNumberIsLoading,
      error: checkValidationNumberError,
    },
  ] = useLazyCheckValidationNumbersQuery();

  useEffect(() => {
    if (!checkValidationNumberData) return;

    if (
      !checkValidationNumberData ||
      !checkValidationNumberData.ok ||
      !checkValidationNumberData.new_code
    ) {
      return;
    }

    setPage("change_password");
    setValidationNumberForChangePassword(checkValidationNumberData.new_code);
  }, [checkValidationNumberData]);

  useEffect(() => {
    if (
      !checkValidationNumberError?.data ||
      !checkValidationNumberError?.data?.err
    )
      return;

    console.log(checkValidationNumberError?.data?.err);

    const errorText = convertRespError(checkValidationNumberError?.data?.err);

    dispatch(
      pushAlert({
        title: t(errorText),
        status: alertStatuses.error,
        delay: 4000,
      }),
    );
  }, [checkValidationNumberError]);

  const [
    changePasswordQuery,
    {
      data: changePasswordQueryData,
      isLoading: changePasswordQueryIsLoading,
      error: changePasswordQueryError,
    },
  ] = useLazyChangePasswordWithValidationNumberQuery();

  useEffect(() => {
    if (!changePasswordQueryData) return;
    SecureStore.setItemAsync(
      "refresh_token",
      changePasswordQueryData.refresh_token,
    );

    setValidationNumber("");
    setaccesstoken(changePasswordQueryData.access_token);
    dispatch(setRefetchClient(true));
    navigator.navigate("Home");
  }, [changePasswordQueryData]);

  useEffect(() => {
    if (!changePasswordQueryError?.data || !changePasswordQueryError?.data?.err)
      return;

    console.log(changePasswordQueryError?.data?.err);

    const errorText = convertRespError(changePasswordQueryError?.data?.err);

    dispatch(
      pushAlert({
        title: t(errorText),
        status: alertStatuses.error,
        delay: 4000,
      }),
    );
  }, [changePasswordQueryError]);
  const sendPhoneNumberCreateSession = async () => {
    const validationError = validatePhoneNumber(phone);
    if (validationError) {
      return;
    }

    generateChangePasswordSession({ phone: trimPhone(phone) });
  };

  const sendValidation = () => {
    if (!+validationNumber || +validationNumber > 1_000_000) return;

    checkValidationNumberQuery({
      phone: trimPhone(phone),
      number: validationNumber.toString(),
    });
  };

  const sendChangePassword = () => {
    let error = validatePhoneNumber(phone);
    if (error !== null) {
      return;
    }

    if (!password || password !== repeatPassword || isNaN(+validationNumber)) {
      return;
    }

    changePasswordQuery({
      phone: trimPhone(phone),
      number: validationNumberForChangePassword.toString(),
      password,
    });
  };

  const isLoading =
    isGenerateSessionLoading ||
    checkValidationNumberIsLoading ||
    changePasswordQueryIsLoading;

  const [validationNumber, setValidationNumber] = useState("");
  const [
    validationNumberForChangePassword,
    setValidationNumberForChangePassword,
  ] = useState("");

  useEffect(() => {
    if (!validationNumber || validationNumber.toString().length !== 6) return;
    sendValidation();
  }, [validationNumber]);

  const [nextSessionTime, setNextSessionTime] = useState("01-01-2006");
  const [timeLeftToNextSession, setTimeLeftToNextSession] = useState("0:59");
  const [canSendAgain, setCanSendAgain] = useState(false);

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    clearInterval(timer);
    if (!nextSessionTime) {
      setTimeLeftToNextSession("0:00");
      setCanSendAgain(true);
    }

    const interval = setInterval(() => {
      const nextSessionDate = GetTimeFromApiTimeString(nextSessionTime);
      const timeNow = new Date();
      const timeLeft = Math.floor((nextSessionDate - timeNow) / 1000);

      if (timeLeft < 0) {
        clearInterval(timer);
        setCanSendAgain(true);
        setTimeLeftToNextSession("0:00");
        return;
      }
      setCanSendAgain(false);

      const minutesLeft = Math.floor(timeLeft / 60);
      let minutesLeftString = minutesLeft.toFixed().toString();
      if (minutesLeft < 10) {
        minutesLeftString = "0" + minutesLeftString;
      }

      const secondsLeft = Math.floor(timeLeft % 60);
      let secondsLeftString = secondsLeft.toFixed().toString();
      if (secondsLeft < 10) {
        secondsLeftString = "0" + secondsLeftString;
      }

      setTimeLeftToNextSession(minutesLeftString + ":" + secondsLeftString);
    }, 1000);

    setTimer(interval);
  }, [nextSessionTime]);

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
          <View style={authStyles.authContainer}>
            <View flex={1} justifyContent="space-around" alignItems="center">
              <Animated.View
                style={{
                  width: 150,
                  paddingVertical: 10,
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
                {t("change_password.headline")}
              </Text>
            </View>
            {/* Form */}
            <View
              style={{
                justifyContent: "center",
                padding: 30,
                paddingBottom: 100,
                gap: 2,
              }}
            >
              {page === "phone" && (
                <ChangePasswordPhoneInput
                  phoneNumber={phone}
                  setPhoneNumber={setPhone}
                />
              )}
              {page === "validation" && (
                <AuthValidationNumber
                  goBack={() => setPage("phone")}
                  canSendAgain={canSendAgain}
                  sendAgain={sendPhoneNumberCreateSession}
                  validationNumber={validationNumber}
                  setValidationNumber={setValidationNumber}
                  nextSessionTime={timeLeftToNextSession}
                />
              )}
              {page === "change_password" && (
                <ChangePasswordNewPasswordInput
                  password={password}
                  setPassword={setPassword}
                  repeatPassword={repeatPassword}
                  setRepeatPassword={setRepeatPassword}
                />
              )}

              <Button
                backgroundColor="emerald.600"
                mt="10"
                onPress={() => {
                  if (page === "phone") {
                    sendPhoneNumberCreateSession();
                  }
                  if (page === "validation") {
                    sendValidation();
                  }
                  if (page === "change_password") {
                    sendChangePassword();
                  }
                }}
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
                onPress={() => navigator.navigate("Authentication")}
                variant="outline"
                mt={2}
                color="coolGray.600"
              >
                <Text textAlign={"center"} color="coolGray.500">
                  {t("registration.go_to_auth")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordForm;
