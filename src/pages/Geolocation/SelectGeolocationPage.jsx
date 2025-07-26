import { KeyboardAvoidingView, Text, View } from "native-base";
import Wrapper from "../Wrapper";
import { AnonymousProBold } from "../../constants/styles-constants";
import SelectGeolocation from "../../widgets/Geolocation/SelectGeolocation";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGeolocation,
  selectHasGeolocationPerm,
  selectNearGeolocation,
  selectNearGeolocationState,
  selectSavedAddresses,
} from "../../features/store/geolocation/geolocationSlice";
import { useEffect, useState } from "react";
import {
  disableNavbar,
  enableNavbar,
} from "../../features/store/navbar/navbarSlice";
import { useTranslation } from "react-i18next";
import SelectFromPreviousGeolocations from "../../widgets/Geolocation/SelectFromPreviousGeolocations";
import { Animated, Dimensions, Platform } from "react-native";
import SelectGeolocationInputs from "../../widgets/Geolocation/SelectGeolocationInputs";
import { Image } from "expo-image";
import { images } from "../../app/images/images";

const SelectGeolocationPage = () => {
  const { t } = useTranslation();
  const location = useSelector(selectGeolocation);
  const nearLocaiton = useSelector(selectNearGeolocation);
  const hasPerm = useSelector(selectHasGeolocationPerm);


  const dispatch = useDispatch();
  useEffect(() => {
    if (!location) dispatch(disableNavbar());

    return () => dispatch(enableNavbar());
  }, [dispatch, location]);

  const [height, setHeight] = useState(0);
  const shouldHideImage = Dimensions.get("window").height - height > 200;
  const savedAddresses = useSelector(selectSavedAddresses);

  const [page, setPage] = useState("select_from_previous");
  const [geolocationOnMap, setGeolocationOnMap] = useState({});

  useEffect(() => {
    if (!geolocationOnMap?.lat || !geolocationOnMap?.lng) {
      return;
    }

    setPage("new_address_inputs");
  }, [geolocationOnMap]);

  return (
    <Wrapper>
      <KeyboardAvoidingView
        flex={1}
        behavior={Platform.OS === "ios" ? "padding" : 0}
      >
        <View
          flex={1}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setHeight(height);
          }}
        >
          {page === "select_from_previous" && (
            <View
              style={{
                height: shouldHideImage ? 0 : "auto",
                overflow: "hidden",
              }}
            >
              <SelectFromPreviousGeolocations
                goToSelectGeolocationOnMap={() => setPage("new_address_map")}
              />
            </View>
          )}
          {page === "new_address_map" && (
            <>
              <View>
                <Text fontFamily={AnonymousProBold} fontSize={22} px={5}>
                  {location || nearLocaiton
                    ? t("select_geolocation.headline")
                    : hasPerm
                      ? t("select_geolocation.wait_geolocation_is_loading")
                      : t("select_geolocation.we_cannot_load_your_geolocaiton")}
                </Text>
              </View>
              <View flex={1}>
                <SelectGeolocation setGeolocation={setGeolocationOnMap} goBack={() => setPage("select_from_previous")} />
              </View>
            </>
          )}
          {page === "new_address_inputs" && (
            <>
              <View flex={1}>
                <SelectGeolocationInputs geolocation={geolocationOnMap} setPage={() => setPage("select_from_previous")} goBack={() => setPage("new_address_map")} />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};

export default SelectGeolocationPage;
