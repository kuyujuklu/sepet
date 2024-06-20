import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import { AnonymousProBold } from "../../constants/styles-constants";
import SelectGeolocation from "../../widgets/Geolocation/SelectGeolocation";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGeolocation,
  selectHasGeolocationPerm,
  selectNearGeolocation,
  selectNearGeolocationState,
} from "../../features/store/geolocation/geolocationSlice";
import { useEffect } from "react";
import {
  disableNavbar,
  enableNavbar,
} from "../../features/store/navbar/navbarSlice";
import { useTranslation } from "react-i18next";

const SelectGeolocationPage = () => {
  const {t} = useTranslation()
  const location = useSelector(selectGeolocation);
  const nearLocaiton = useSelector(selectNearGeolocation);
  const hasPerm = useSelector(selectHasGeolocationPerm)

  const dispatch = useDispatch();
  useEffect(() => {
    if (!location) dispatch(disableNavbar());

    return () => dispatch(enableNavbar());
  }, [dispatch, location]);

  return (
    <Wrapper>
      <View flexDir={"row"} justifyContent={"center"}>
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
    </Wrapper>
  );
};

export default SelectGeolocationPage;
