import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { cities, getCityTranslationKey } from "../../shared/utils/cities";
import { setApproximateGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { events, track } from "../../shared/analytics/analytics";
import { SCREEN_PADDING } from "../../constants/layout";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 16,
    gap: 10,
  },
  headline: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 19,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 6,
  },
  city: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  cityText: {
    fontSize: 16,
    color: "#111",
  },
  settings: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    color: "#059669",
    textDecorationLine: "underline",
  },
});

// Fallback when the client refused the location permission: one screen, a list
// of cities, no map and no street. It only needs to be good enough to show the
// right pubs - the delivery address is asked for at checkout.
const CityPicker = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectCity = (city) => {
    track(events.citySelected, { city: city.id });
    dispatch(
      setApproximateGeolocation({
        lat: city.lat,
        lng: city.lng,
        cityId: city.id,
      }),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.headline}>{t("city_picker.headline")}</Text>
      <Text style={styles.subheadline}>{t("city_picker.subheadline")}</Text>

      {cities.map((city) => (
        <TouchableOpacity
          key={city.id}
          activeOpacity={0.8}
          onPress={() => selectCity(city)}
        >
          <View style={styles.city}>
            <Text style={styles.cityText}>
              {t(getCityTranslationKey(city.id))}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.settings}>{t("city_picker.open_settings")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CityPicker;
