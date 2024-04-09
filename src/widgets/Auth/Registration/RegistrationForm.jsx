import { Button, Icon, Spinner, Text, View } from "native-base";
import { authStyles } from "../auth.styles";
import RegistrationDataInputs from "./RegistrationDataInputs";
import { useEffect, useRef, useState } from "react";
import AuthValidationNumber from "../AuthValidationNumber";
import { GetTimeFromApiTimeString } from "../../../shared/utils/time";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { useNavigation } from "@react-navigation/native";
import {
  useLazyRegistrateQuery,
  useLazyValidateRegistrationQuery,
} from "../../../shared/api/client/clientAuth";
import {
  errorKeys,
  pushError,
} from "../../../features/store/errorHandling/errorHandlingSlice";
import { pushAlert } from "../../../features/store/alerts/alertSlice";
import { enableNavbar } from "../../../features/store/navbar/navbarSlice";

const RegistrationForm = () => {
  const timestampRef = useRef(Date.now()).current;
  const dispatch = useDispatch();

  const navigator = useNavigation();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [
    registrationQuery,
    {
      data: registrationQueryData,
      error: registrationQueryError,
      isLoading: registrationDataIsLoading,
    },
  ] = useLazyRegistrateQuery({ sessionId: timestampRef });

  const sendRegistration = async ({ phone, name }) => {
    registrationQuery({ phone, name });
  };

  //Handling registration data sending success
  useEffect(() => {
    if (!registrationQueryData || !registrationQueryData.ok) return;

    if (registrationQueryData.next_session_time)
      setNextSessionTime(
        GetTimeFromApiTimeString(registrationQueryData.next_session_time)
      );

    setCurrentPage("validation");
  }, [registrationQueryData]);

  // Handling registration data sending error
  useEffect(() => {
    if (!registrationQueryError?.data || !registrationQueryError?.data?.err)
      return;

    console.log("registration session error: ", registrationQueryError);

    if (registrationQueryError.data.err === "too many login sessions") {
      setNextSessionTime(
        GetTimeFromApiTimeString(registrationQueryError.data.next_session_time)
      );
    }

    dispatch(
      pushError({
        errorKey: errorKeys.registrationData,
        error: registrationQueryError.data.err,
      })
    );
  }, [registrationQueryError]);

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
  ] = useLazyValidateRegistrationQuery({
    
  });

  const [validationNumber, setValidationNumber] = useState();

  const sendValidation = async () => {
    if(!(+validationNumber)) {
      dispatch(pushAlert({
        title: "not all symbols are correct",
        delay: 2000,
        status: "warning"        
      }))
      return;
    }
    if(validationNumber.toString().length !== 6) {
      dispatch(pushAlert({
        title: "validation number length should be equal 6",
        delay: 2000,
        status: "warning"        
      }))
      return;
    }
    
    validationQuery({ phone, validationNumber: +validationNumber }, false);
  };

  //Sending validation number to server when it has all 6 chars
  useEffect(() => {
    if(+validationNumber && validationNumber.length === 6) {
      sendValidation()
      return
    }
  }, [validationNumber]);

  //Handling validationQuery success
  useEffect(() => {
    if (!validationQueryData?.ok) {
      return;
    }

    setaccesstoken(validationQueryData.access_token);
    dispatch(enableNavbar())
    navigator.navigate("Home");
  }, [validationQueryData]);

  //Handling validationQuery error
  useEffect(() => {
    if (!vaildationQueryError?.data?.err) {
      return;
    }
    console.log("validation query error: ", vaildationQueryError);

    dispatch(pushError({errorKey: errorKeys.registrationValidation, error: vaildationQueryError?.data?.err}))
  }, [vaildationQueryError]);

  const [currentPage, setCurrentPage] = useState("data"); //data or validation

  const isLoading = registrationDataIsLoading || validationQueryIsLoading;

  return (
    <View style={authStyles.authContainer}>
      <Text style={authStyles.authHeadline}>Registration</Text>
      {/* Form */}
      <View style={authStyles.authFormContainer}>
        {currentPage === "data" && (
          <RegistrationDataInputs
            phoneNumber={phone}
            setPhoneNumber={setPhone}
            name={name}
            setName={setName}
          />
        )}

        {currentPage === "validation" && (
          <AuthValidationNumber
            nextSessionTime={timeRemaining}
            canSendAgain={nextSessionTime < new Date()}
            goBack={() => setCurrentPage("data")}
            validationNumber={validationNumber}
            setValidationNumber={setValidationNumber}
          />
        )}

        <Button
          primary
          mt={"10"}
          onPress={() => {
            if (currentPage === "data") sendRegistration({ phone, name });
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

        <Button onPress={() => navigator.navigate("Authentication")} variant="outline" mt={2} color="coolGray.600">
            <Text color="coolGray.500" textAlign={"center"}>
              Already have an account? Authentication
            </Text>
        </Button>

      </View>
    </View>
  );
};

export default RegistrationForm;
