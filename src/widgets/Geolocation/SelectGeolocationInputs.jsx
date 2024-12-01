import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import {
  selectHasGeolocationPerm,
  selectNearGeolocation,
  selectNearGeolocationState,
  setGeolocation,
  setNearGeolocation,
  setSavedAddresses,
} from "../../features/store/geolocation/geolocationSlice";
import { useEffect, useRef, useState } from "react";
import { Button, KeyboardAvoidingView, ScrollView, Spinner, Text, View } from "native-base";
import { Animated, Dimensions, Image, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import InputWithValidation from "../Inputs/InputWithValidation";
import {
  validateFullAddress,
  validateTown,
} from "../../shared/validation/validators/order/order-validator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "../../app/images/images";
import { AnonymousProBold } from "../../constants/styles-constants";

const mapStyle = {
  map: {
    width: "100%",
    height: "100%",
  },
};
const SelectGeolocationInputs = ({setPage, geolocation, goBack}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const [town, setTown] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [triedToSelectGeolocation, setTriedToSelectGeolocation] = useState("");
  const [resetErrors, setResetErrors] = useState(false);

  const handleSelectLocationByYourself = () => {
    setCenter({ lat: 47.00367, lng: 28.907089 });
    dispatch(setNearGeolocation({ lat: 47.00367, lng: 28.907089 }));
    setZoom(10);
  };

  const handleSetLocationButtonClick = () => {
    (async function () {
      const townError = validateTown(town);
      const fullAddressError = validateFullAddress(fullAddress);
      if (townError !== null || fullAddressError !== null) {
        setTriedToSelectGeolocation(true);
        return;
      }

      if (!geolocation) return;

      let savedAddresses = [];
      try {
        const value = await AsyncStorage.getItem("saved_addresses");
        if (value !== null) {
          savedAddresses = JSON.parse(value);
        }
      } catch (e) {
        console.log("getting saved addresses error: ", e);
        savedAddresses = [];
      }

      savedAddresses.push({
        town,
        fullAddress,
        lat: geolocation.lat,
        lng: geolocation.lng,
      });
      AsyncStorage.setItem("saved_addresses", JSON.stringify(savedAddresses));

      dispatch(setSavedAddresses({ addresses: savedAddresses }));

      setTown("");
      setFullAddress("");
      setTriedToSelectGeolocation(false);
      dispatch(
        setGeolocation({
          lat: geolocation.lat,
          lng: geolocation.lng,
          town: town,
          fullAddress: fullAddress,
        }),
      );
      
      setPage()
      navigator.navigate("Home");
    })();
  };

  const [scrollViewHeight, setScrollViewHeight] = useState(0);
   const shouldHideImage = Dimensions.get("window").height - scrollViewHeight > 300;
  //  const shouldHideImage = true;
  const [animatedHeight] = useState(new Animated.Value(0));
  useEffect(() => {
    animatedHeight.stopAnimation();
    // if (scrollViewHeight === 0) {
    //   return;
    // }

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
        setScrollViewHeight(height);
      }}
      keyboardShouldPersistTaps={"handled"}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View px="4" w="full" flex={1}>

        <View
          flex={1}
          justifyContent="space-around"
          alignItems="center"
          py={10}
          w="full"
        >
          <Animated.View
            style={{
              width: 200,
              height: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
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
                <Text
                  fontSize={28}
                  mb="5"
                  fontWeight="bold"
                  textAlign="center"
                  fontFamily={AnonymousProBold}
                >
                  {t("select_geolocation.add_address_inputs_headline")}
                </Text>
              </View>
        <InputWithValidation
          resetErrors={resetErrors}
          setResetErrors={setResetErrors}
          value={town}
          setValue={setTown}
          label={t("create_order_page.additional_data.inputs.town.label")}
          keyboardType={"default"}
          validators={[validateTown]}
          validatedOutside={triedToSelectGeolocation}
        />
        <InputWithValidation
          resetErrors={resetErrors}
          setResetErrors={setResetErrors}
          value={fullAddress}
          setValue={setFullAddress}
          label={t(
            "create_order_page.additional_data.inputs.full_address.label",
          )}
          keyboardType={"default"}
          validators={[validateFullAddress]}
          validatedOutside={triedToSelectGeolocation}
        />
        <Button
          disabled={!geolocation}
          background={!geolocation ? "coolGray.400" : "emerald.600"}
          borderRadius={15}
          mt={8}
          mb={4}
          onPress={handleSetLocationButtonClick}
        >
          {t("select_geolocation.continue")}
        </Button>
        <Button
          background={"red.600"}
          borderRadius={15}
          mb={10}
          onPress={goBack}
        >
          {t("select_geolocation.back")}
        </Button>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SelectGeolocationInputs;
