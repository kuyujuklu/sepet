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
          {savedAddresses && savedAddresses.length > 0 && (
            <View
              style={{
                height: shouldHideImage ? 0 : "auto",
                overflow: "hidden",
              }}
            >
              <SelectFromPreviousGeolocations />
            </View>
          )}
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
            <SelectGeolocation />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};

export default SelectGeolocationPage;
