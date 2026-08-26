import { useMemo } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  selectGeolocation,
  selectNearGeolocation,
  selectSavedAddresses,
  setGeolocation,
  setNearGeolocation,
  setSavedAddresses,
} from "../../features/store/geolocation/geolocationSlice";
import { images } from "../../app/images/images";
import { useLinkedDestination } from "../../shared/hooks/useLinkedDestination";
import { getLocationLabel } from "../../shared/utils/geolocation";
import { SCREEN_PADDING } from "../../constants/layout";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 32,
    gap: 10,
  },
  intro: { marginTop: 4, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#6b7280", lineHeight: 19, marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: { width: 20, height: 20, opacity: 0.6 },
  town: { fontSize: 15, fontWeight: "bold", color: "#111" },
  address: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  currentCard: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#059669",
  },
  currentHint: { fontSize: 12, color: "#047857", marginTop: 2 },
  remove: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
  },
  removeIcon: { width: 17, height: 17 },
  add: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#059669",
    paddingVertical: 16,
    marginTop: 16,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  empty: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: "bold", color: "#111" },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 18 },
});

// The address screen. Three things in one place: keep browsing with the
// location we already guessed, pick an address used before, or add a new one.
const SelectFromPreviousGeolocations = ({ goToSelectGeolocationOnMap }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const savedAddressesFromSlice = useSelector(selectSavedAddresses);
  const location = useSelector(selectGeolocation);
  const nearLocation = useSelector(selectNearGeolocation);

  const { goToLinkedDestination } = useLinkedDestination();

  // Newest first, all of them - the list used to be capped at three with no
  // way to reach the rest
  const savedAddresses = useMemo(
    () => (savedAddressesFromSlice ? [...savedAddressesFromSlice].reverse() : []),
    [savedAddressesFromSlice],
  );

  const currentLabel = getLocationLabel(location, t);
  const canUseCurrent = !!(location?.lat || nearLocation?.lat);

  const selectGeolocationAddress = ({ lat, lng, town, fullAddress }) => {
    track(events.addressSelected, { source: "saved_list" });

    dispatch(setGeolocation({ lat, lng, town, fullAddress }));
    dispatch(setNearGeolocation({ lat, lng }));

    goToLinkedDestination();
  };

  const useCurrentLocation = () => {
    track(events.addressSelected, { source: "current_location" });
    goToLinkedDestination();
  };

  const removeAddress = (address) => {
    const rest = (savedAddressesFromSlice ?? []).filter(
      (saved) =>
        saved?.town !== address?.town ||
        saved?.fullAddress !== address?.fullAddress,
    );

    AsyncStorage.setItem("saved_addresses", JSON.stringify(rest));
    dispatch(setSavedAddresses({ addresses: rest }));
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text style={styles.title}>{t("select_geolocation.title")}</Text>
        <Text style={styles.subtitle}>{t("select_geolocation.subtitle")}</Text>
      </View>

      {canUseCurrent && (
        <>
          <Text style={styles.sectionTitle}>
            {t("select_geolocation.current_section")}
          </Text>

          <TouchableOpacity activeOpacity={0.85} onPress={useCurrentLocation}>
            <View style={[styles.card, styles.currentCard]}>
              <Image
                source={images.Locaiton}
                style={styles.icon}
                contentFit="contain"
                alt=""
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.town} numberOfLines={1}>
                  {currentLabel ?? t("header.near_you")}
                </Text>
                <Text style={styles.currentHint}>
                  {t("select_geolocation.use_current")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>
        {t("select_geolocation.saved_addresses")}
      </Text>

      {savedAddresses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {t("select_geolocation.no_saved_title")}
          </Text>
          <Text style={styles.emptyText}>
            {t("select_geolocation.no_saved_text")}
          </Text>
        </View>
      ) : (
        savedAddresses.map((address, index) => (
          <View
            key={`${address?.town}-${address?.fullAddress}-${index}`}
            style={styles.card}
          >
            <Image
              source={images.Locaiton}
              style={styles.icon}
              contentFit="contain"
              alt=""
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flex: 1 }}
              onPress={() =>
                selectGeolocationAddress({
                  lat: address.lat,
                  lng: address.lng,
                  town: address.town,
                  fullAddress: address.fullAddress,
                })
              }
            >
              <Text style={styles.town} numberOfLines={1}>
                {address.town}
              </Text>
              <Text style={styles.address} numberOfLines={2}>
                {address.fullAddress}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => removeAddress(address)}
            >
              <View style={styles.remove}>
                <Image
                  source={images.TrashRed}
                  style={styles.removeIcon}
                  contentFit="contain"
                  alt=""
                />
              </View>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity activeOpacity={0.85} onPress={goToSelectGeolocationOnMap}>
        <View style={styles.add}>
          <Text style={styles.addText}>
            + {t("select_geolocation.add_new_address")}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SelectFromPreviousGeolocations;
