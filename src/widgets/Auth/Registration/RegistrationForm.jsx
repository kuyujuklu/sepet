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
import RegistrationDataInputs from "./RegistrationDataInputs";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import {
  useLazyGenerateRegistrationSessionQuery,
  useLazyRegistrateQuery,
  useLazyValidateRegistrationNumberQuery,
} from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import { enableNavbar } from "../../../features/store/navbar/navbarSlice";
import { useTranslation } from "react-i18next";
import { ENV } from "../../../constants/env/env";
import { validateRegistrationData } from "../../../shared/validation/validators/client/client-validation";
import { Image } from "expo-image";
import { images } from "../../../app/images/images";
import { Animated, Dimensions, Keyboard, Platform, TouchableOpacity } from "react-native";
import { setRefetchClient } from "../../../features/store/auth/authSlice";
import AuthValidationNumber from "../AuthValidationNumber";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import forbidPropTypes from "eslint-plugin-react/lib/rules/forbid-prop-types";
import {
  alertStatuses,
  pushAlert,
} from "../../../features/store/alerts/alertSlice";
import { appErrors } from "../../../app/errors/appErrors";
import { convertRespError } from "../../../app/errors/convertApiErrors";
import { trimPhone } from "../../../shared/utils/phone-utils";
import { Linking } from "react-native";

const RegistrationForm = () => {
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const dispatch = useDispatch();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // const [
  //   registrationQuery,
  //   {
  //     data: registrationQueryData,
  //     error: registrationQueryError,
  //     isLoading: registrationQueryIsLoading,
  //   },
  // ] = useLazyRegistrateQuery({ sessionId: timestampRef });

  // //Handling registration data sending success
  // useEffect(() => {
  //   if (!registrationQueryData || !registrationQueryData.ok) return;

  //   SecureStore.setItemAsync(
  //     "refresh_token",
  //     registrationQueryData.refresh_token,
  //   );

  //   setaccesstoken(registrationQueryData.access_token);
  //   dispatch(enableNavbar());
  //   dispatch(setRefetchClient(true));
  //   navigator.navigate("SelectGeolocationPage");
  // }, [registrationQueryData]);

  // // // Handling registration data sending error
  // useEffect(() => {
  //   if (!registrationQueryError?.data || !registrationQueryError?.data?.err)
  //     return;

  //   dispatch(
  //     pushError({
  //       errorKey: errorKeys.registration,
  //       error: registrationQueryError.data.err,
  //     }),
  //   );
  // }, [registrationQueryError]);

  const [page, setPage] = useState("data"); //data or validation

  const [
    generateSessionQuery,
    {
      data: generateSessionData,
      isLoading: isGenerateSessionLoading,
      error: generateSessionError,
    },
  ] = useLazyGenerateRegistrationSessionQuery();

  useEffect(() => {
    if (!generateSessionData) return;
    setPage("validation");
    setNextSessionTime(generateSessionData.next_session_time);
  }, [generateSessionData]);

  useEffect(() => {
    if (!generateSessionError) return;
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
    validationSessionNumberQuery,
    {
      data: validateSessionNumberData,
      isLoading: isValidateSessionNumberLoading,
      error: validateSessionNumberError,
    },
  ] = useLazyValidateRegistrationNumberQuery();

  useEffect(() => {
    if (!validateSessionNumberData) return;
    SecureStore.setItemAsync(
      "refresh_token",
      validateSessionNumberData.refresh_token,
    );

    setValidationNumber("");
    setaccesstoken(validateSessionNumberData.access_token);
    dispatch(enableNavbar());
    dispatch(setRefetchClient(true));
    navigator.navigate("SelectGeolocationPage");
  }, [validateSessionNumberData]);

  useEffect(() => {
    if (
      !validateSessionNumberError?.data ||
      !validateSessionNumberError?.data?.err
    )
      return;

    console.log(validateSessionNumberError?.data?.err);

    const errorText = convertRespError(validateSessionNumberError?.data?.err);

    dispatch(
      pushAlert({
        title: t(errorText),
        status: alertStatuses.error,
        delay: 4000,
      }),
    );
  }, [validateSessionNumberError]);

  const sendRegistrationDataForSession = async () => {
    const registrationData = {
      phone,
      name,
      password,
      repeatPassword,
    };
    const validationError = validateRegistrationData(registrationData);
    if (validationError) {
      return;
    }

    generateSessionQuery({ phone: trimPhone(phone), name, password });
  };

  const sendValidation = () => {
    if (!+validationNumber || +validationNumber > 1_000_000) return;

    validationSessionNumberQuery({
      phone: trimPhone(phone),
      number: validationNumber.toString(),
    });
  };

  const isLoading = isGenerateSessionLoading || isValidateSessionNumberLoading;
  const [validationNumber, setValidationNumber] = useState("");

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
        py={5}
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
          <View style={authStyles.authContainer}>
            <View>
              <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                {t("registration.headline")}
              </Text>
            </View>
            {/* Form */}
            <View
              style={{
                justifyContent: "center",
                padding: 30,
                paddingBottom: 100,
                gap: 2,
                width: "100%",
              }}
            >
              {page === "data" && (
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
              )}

              {page === "validation" && (
                <AuthValidationNumber
                  goBack={() => setPage("data")}
                  canSendAgain={canSendAgain}
                  sendAgain={sendRegistrationDataForSession}
                  validationNumber={validationNumber}
                  setValidationNumber={setValidationNumber}
                  nextSessionTime={timeLeftToNextSession}
                />
              )}

              <Button
                background="emerald.600"
                mt="10"
                onPress={() => {
                  if (page === "data") {
                    sendRegistrationDataForSession();
                  }
                  if (page === "validation") {
                    sendValidation();
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
                {isLoading ? (
                  <Spinner color="white" />
                ) : (
                  t("registration.submit")
                )}
              </Button>

              <Button
                onPress={() => navigator.navigate("Authentication")}
                variant="outline"
                mt={2}
                color="coolGray.600"
              >
                <Text color="coolGray.500" textAlign="center">
                  {t("registration.go_to_auth")}
                </Text>
              </Button>
              <View flex={1} justifyContent="center" alignItems="center">
                <Text textAlign={"center"} color="coolGray.500" fontSize={10} mt={3}>
                  {t("auth.privacy_policy_text")} {" "}
                </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.canOpenURL(
                        "https://www.termsfeed.com/live/ebacde7a-7bb6-4e3f-b5f0-85e084530b3a",
                      ).then((supported) => {
                        if (supported) {
                          Linking.openURL(
                            "https://www.termsfeed.com/live/ebacde7a-7bb6-4e3f-b5f0-85e084530b3a",
                          );
                        } else {
                          console.log(
                            "Don't know how to open URI: " + this.props.url,
                          );
                        }
                      })
                    }
                  >
                    <Text color="blue.400" fontSize={10}>{t("auth.privacy_policy_link")}</Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistrationForm;
