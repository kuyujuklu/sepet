import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import SelectGeolocation from "../../widgets/Geolocation/SelectGeolocation";
import SelectFromPreviousGeolocations from "../../widgets/Geolocation/SelectFromPreviousGeolocations";
import SelectGeolocationInputs from "../../widgets/Geolocation/SelectGeolocationInputs";
import {
  selectGeolocation,
  selectHasGeolocationPerm,
  selectNearGeolocation,
} from "../../features/store/geolocation/geolocationSlice";
import { SCREEN_PADDING } from "../../constants/layout";

const pages = {
  list: "select_from_previous",
  map: "new_address_map",
  inputs: "new_address_inputs",
};

const styles = StyleSheet.create({
  mapHint: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 8,
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
});

const SelectGeolocationPage = () => {
  const { t } = useTranslation();

  const location = useSelector(selectGeolocation);
  const nearLocation = useSelector(selectNearGeolocation);
  const hasPerm = useSelector(selectHasGeolocationPerm);

  const [page, setPage] = useState(pages.list);
  const [geolocationOnMap, setGeolocationOnMap] = useState({});

  useEffect(() => {
    if (!geolocationOnMap?.lat || !geolocationOnMap?.lng) return;

    setPage(pages.inputs);
  }, [geolocationOnMap]);

  const mapHint =
    location || nearLocation
      ? t("select_geolocation.headline")
      : hasPerm
        ? t("select_geolocation.wait_geolocation_is_loading")
        : t("select_geolocation.we_cannot_load_your_geolocaiton");

  return (
    <Wrapper>
      {/* The screen is reached from the address in the top bar, so it needs a
          way back; the map and the inputs carry their own */}
      <AppHeader
        showBack
        showAddress={false}
        right={null}
        title={t("select_geolocation.change_geolocation")}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          {page === pages.list && (
            <SelectFromPreviousGeolocations
              goToSelectGeolocationOnMap={() => setPage(pages.map)}
            />
          )}

          {page === pages.map && (
            <>
              <Text style={styles.mapHint}>{mapHint}</Text>
              <View style={{ flex: 1 }}>
                <SelectGeolocation
                  setGeolocation={setGeolocationOnMap}
                  goBack={() => setPage(pages.list)}
                />
              </View>
            </>
          )}

          {page === pages.inputs && (
            <View style={{ flex: 1 }}>
              <SelectGeolocationInputs
                geolocation={geolocationOnMap}
                setPage={() => setPage(pages.list)}
                goBack={() => setPage(pages.map)}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};

export default SelectGeolocationPage;
