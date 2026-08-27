import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import InputWithValidation from "../Inputs/InputWithValidation";
import {
  validateFullAddress,
  validateTown,
} from "../../shared/validation/validators/order/order-validator";
import { setGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { appendSavedAddress } from "../../shared/utils/savedAddresses";
import { describeCoords } from "../../shared/utils/geolocation";
import { useLinkedDestination } from "../../shared/hooks/useLinkedDestination";
import { images } from "../../app/images/images";
import { SCREEN_PADDING } from "../../constants/layout";
import { events, track } from "../../shared/analytics/analytics";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#6b7280", lineHeight: 19, marginTop: 4 },
  pin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  pinIcon: { width: 18, height: 18, opacity: 0.7 },
  pinText: { flex: 1, fontSize: 13, color: "#047857", lineHeight: 18 },
  pinChange: { fontSize: 13, color: "#047857", fontWeight: "bold" },
  detecting: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  detectingText: { fontSize: 12, color: "#6b7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 18,
    marginTop: 14,
  },
  primary: {
    borderRadius: 18,
    backgroundColor: "#059669",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  primaryDisabled: { backgroundColor: "#a1a1aa" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondary: { paddingVertical: 14, alignItems: "center", marginTop: 4 },
  secondaryText: { color: "#52525b", fontSize: 15, fontWeight: "500" },
});

// Step two of adding an address: the point is already on the map, the client
// writes down what it is called. Saving it also makes it the current address.
const SelectGeolocationInputs = ({ setPage, geolocation, goBack }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [town, setTown] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [resetErrors, setResetErrors] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const { goToLinkedDestination } = useLinkedDestination();

  // A guess, not a lock: reverse-geocodes the pinned point so the client
  // corrects a suggestion instead of typing the whole address from nothing.
  // Guarded so it never clobbers a value the client already typed - a slow
  // network reply landing after they started writing must not erase it.
  const editedRef = useRef(false);

  useEffect(() => {
    if (!geolocation?.lat || !geolocation?.lng) return;

    let isActual = true;
    setIsDetecting(true);

    describeCoords(geolocation).then((description) => {
      if (!isActual || editedRef.current) return;

      if (description.town) setTown(description.town);
      if (description.fullAddress) setFullAddress(description.fullAddress);

      setIsDetecting(false);
    });

    return () => {
      isActual = false;
    };
  }, [geolocation?.lat, geolocation?.lng]);

  const markEdited = () => {
    editedRef.current = true;
    setIsDetecting(false);
  };

  const handleTownChange = (value) => {
    markEdited();
    setTown(value);
  };

  const handleFullAddressChange = (value) => {
    markEdited();
    setFullAddress(value);
  };

  const handleSetLocationButtonClick = () => {
    (async function () {
      if (validateTown(town) !== null || validateFullAddress(fullAddress) !== null) {
        setTriedToSubmit(true);
        return;
      }

      if (!geolocation) return;

      await appendSavedAddress(dispatch, {
        town,
        fullAddress,
        lat: geolocation.lat,
        lng: geolocation.lng,
      });

      dispatch(
        setGeolocation({
          lat: geolocation.lat,
          lng: geolocation.lng,
          town,
          fullAddress,
        }),
      );

      track(events.addressSelected, { source: "new_address", town });

      setTown("");
      setFullAddress("");
      setTriedToSubmit(false);
      setPage();

      goToLinkedDestination();
    })();
  };

  const isReady = !!geolocation && !!town && !!fullAddress;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {t("select_geolocation.add_address_inputs_headline")}
        </Text>
        <Text style={styles.subtitle}>
          {t("select_geolocation.add_address_inputs_hint")}
        </Text>

        <View style={styles.pin}>
          <Image
            source={images.Locaiton}
            style={styles.pinIcon}
            contentFit="contain"
            alt=""
          />
          <Text style={styles.pinText}>
            {t("select_geolocation.point_on_map")}
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={goBack}>
            <Text style={styles.pinChange}>
              {t("select_geolocation.change_point")}
            </Text>
          </TouchableOpacity>
        </View>

        {isDetecting && (
          <View style={styles.detecting}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.detectingText}>
              {t("select_geolocation.detecting_address")}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <InputWithValidation
            resetErrors={resetErrors}
            setResetErrors={setResetErrors}
            value={town}
            setValue={handleTownChange}
            label={t("create_order_page.additional_data.inputs.town.label")}
            keyboardType={"default"}
            validators={[validateTown]}
            validatedOutside={triedToSubmit}
          />
          <InputWithValidation
            resetErrors={resetErrors}
            setResetErrors={setResetErrors}
            value={fullAddress}
            setValue={handleFullAddressChange}
            label={t(
              "create_order_page.additional_data.inputs.full_address.label",
            )}
            keyboardType={"default"}
            validators={[validateFullAddress]}
            validatedOutside={triedToSubmit}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSetLocationButtonClick}
        >
          <View style={[styles.primary, !isReady && styles.primaryDisabled]}>
            <Text style={styles.primaryText}>
              {t("select_geolocation.save_address")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={goBack}>
          <View style={styles.secondary}>
            <Text style={styles.secondaryText}>
              {t("select_geolocation.back")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SelectGeolocationInputs;
