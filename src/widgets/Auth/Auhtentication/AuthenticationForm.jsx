import { Button, Icon, Spinner, Text, View } from "native-base";
import { authStyles } from "../auth.styles";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import {
  useLazyCreateAuthenticationSessionQuery,
  useLazyValidateAuthenticationQuery,
} from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import { pushAlert } from "../../../features/store/alerts/alertSlice";
import AuthValidationNumber from "../AuthValidationNumber";
import AuthenticationDataInputs from "./AuthenticationDataInputs";
import { enableNavbar } from "../../../features/store/navbar/navbarSlice";

const AuthenticationForm = () => {
  const dispatch = useDispatch();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");

  const [
    authenticationQuery,
    {
      data: authenticationQueryData,
      error: authenticationQueryError,
      isLoading: authenticationDataIsLoading,
    },
  ] = useLazyCreateAuthenticationSessionQuery({});

  const sendAuthentication = async () => {
    console.log("sending authentication");
    authenticationQuery({ phone });
  };

  //Handling authentication data sending success
  useEffect(() => {
    if (!authenticationQueryData || !authenticationQueryData.ok) return;

    console.log(authenticationQueryData);

    if (authenticationQueryData.next_session_time)
      setNextSessionTime(
        GetTimeFromApiTimeString(authenticationQueryData.next_session_time)
      );

    setCurrentPage("validation");
  }, [authenticationQueryData]);

  // Handling authentication data sending error
  useEffect(() => {
    console.log("authentication session error: ", authenticationQueryError);
    if (!authenticationQueryError?.data || !authenticationQueryError?.data)
      return;

    if (authenticationQueryError.data.err === "too many login sessions") {
      setNextSessionTime(
        GetTimeFromApiTimeString(
          authenticationQueryError.data.next_session_time
        )
      );
    }

    dispatch(
      pushError({
        errorKey: errorKeys.authenticationData,
        error: authenticationQueryError.data.err,
      })
    );
  }, [authenticationQueryError]);

  // Time ticking before next session
  const [timeTickerInterval, setTimeTickerInterval] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [nextSessionTime, setNextSessionTime] = useState(null);

  // Update time remaining, if nextSessionTimeIsDefined
  useEffect(() => {
    if (!nextSessionTime) return;

    if (nextSessionTime > new Date()) {
      clearInterval(timeTickerInterval);
      const interv = setInterval(() => {
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = nextSessionTime - now;
        if (distance < 0) {
          setTimeRemaining(0);
          clearInterval(interv);
          return;
        }
        // Time calculations for minutes and seconds, because max api time range is an hour
        let minutes = Math.floor(distance / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let finalString = "00";

        if (minutes) {
          finalString = minutes;
        }

        finalString += ":";

        if (seconds < 10) {
          finalString += "0";
        }

        finalString += seconds;
        setTimeRemaining(finalString);
      }, 1000);

      setTimeTickerInterval(interv);
    }

    return () => {
      clearInterval(timeTickerInterval);
    };
  }, [nextSessionTime]);

  //Validation logic
  const [
    validationQuery,
    {
      data: validationQueryData,
      error: vaildationQueryError,
      isLoading: validationQueryIsLoading,
    },
  ] = useLazyValidateAuthenticationQuery({});

  const [validationNumber, setValidationNumber] = useState();

  const sendValidation = async () => {
    if (!+validationNumber) {
      dispatch(
        pushAlert({
          title: "not all symbols are correct",
          delay: 2000,
          status: "warning",
        })
      );
      return;
    }
    if (validationNumber.toString().length !== 6) {
      dispatch(
        pushAlert({
          title: "validation number length should be equal 6",
          delay: 2000,
          status: "warning",
        })
      );
      return;
    }

    validationQuery({ phone, validationNumber: +validationNumber }, false);
  };

  //Sending validation number to server when it has all 6 chars
  useEffect(() => {
    if (+validationNumber && validationNumber.length === 6) {
      sendValidation();
      return;
    }
  }, [validationNumber]);

  //Handling validationQuery success
  useEffect(() => {
    if (!validationQueryData?.ok) {
      return;
    }

    setaccesstoken(validationQueryData.access_token);
    dispatch(enableNavbar());
    console.log(
      "setting refresh token: ",
      validationQueryData.refresh_token
    );
    SecureStore.setItemAsync(
      "refresh_token",
      validationQueryData.refresh_token
    );
    navigator.navigate("Home");
  }, [validationQueryData]);

  //Handling validationQuery error
  useEffect(() => {
    if (!vaildationQueryError?.data?.err) {
      return;
    }
    console.log("validation query error: ", vaildationQueryError);

    dispatch(
      pushError({
        errorKey: errorKeys.registrationValidation,
        error: vaildationQueryError?.data?.err,
      })
    );
  }, [vaildationQueryError]);

  const [currentPage, setCurrentPage] = useState("data"); //data or validation

  const isLoading = authenticationDataIsLoading || validationQueryIsLoading;

  return (
    <View style={authStyles.authContainer}>
      <Text style={authStyles.authHeadline}>Authentication</Text>
      {/* Form */}
      <View style={authStyles.authFormContainer}>
        {currentPage === "data" && (
          <AuthenticationDataInputs
            phoneNumber={phone}
            setPhoneNumber={setPhone}
          />
        )}

        {currentPage === "validation" && (
          <AuthValidationNumber
            nextSessionTime={timeRemaining}
            canSendAgain={nextSessionTime < new Date()}
            goBack={() => setCurrentPage("data")}
            validationNumber={validationNumber}
            setValidationNumber={setValidationNumber}
            sendAgain={sendAuthentication}
          />
        )}

        <Button
          primary
          mt={"10"}
          onPress={() => {
            if (currentPage === "data") sendAuthentication();
            if (currentPage === "validation") sendValidation();
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
          {isLoading ? <Spinner color={"white"} /> : "Submit"}
        </Button>

        <Button
          onPress={() => navigator.navigate("Registration")}
          variant="outline"
          mt={2}
          color="coolGray.600"
        >
          <Text textAlign={"center"} color="coolGray.500">
            Dont have an account? Registration
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default AuthenticationForm;
