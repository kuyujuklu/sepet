import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { SheetButton } from "../../Common/BottomSheet";
import {
  selectGeolocation,
  selectSavedAddresses,
  setGeolocation,
} from "../../../features/store/geolocation/geolocationSlice";
import { events, track } from "../../../shared/analytics/analytics";

const styles = StyleSheet.create({
  list: { gap: 8, marginBottom: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f6f6f7",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemSelected: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#059669",
  },
  town: { fontSize: 15, fontWeight: "bold", color: "#111" },
  address: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  check: { fontSize: 16, color: "#059669", fontWeight: "bold" },
  empty: { fontSize: 14, color: "#6b7280", lineHeight: 19, marginBottom: 16 },
});

// Saved addresses at checkout. Picking one does not just fill the two inputs:
// it also moves the geolocation to that address, so the order is sent with the
// coordinates of the place it is actually going to.
const AddressPickerSheet = ({ isOpened, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const savedAddresses = useSelector(selectSavedAddresses);
  const location = useSelector(selectGeolocation);

  const addresses = savedAddresses ? [...savedAddresses].reverse() : [];

  const select = (address) => {
    track(events.addressSelected, { source: "checkout_saved" });

    dispatch(
      setGeolocation({
        lat: address?.lat,
        lng: address?.lng,
        town: address?.town,
        fullAddress: address?.fullAddress,
      }),
    );

    onClose?.();
  };

  const addNew = () => {
    onClose?.();
    navigator.navigate("SelectGeolocationPage");
  };

  return (
    <BottomSheet
      isOpened={isOpened}
      onClose={onClose}
      title={t("create_order_page.address.saved_title")}
      scrollable
    >
      {addresses.length === 0 ? (
        <Text style={styles.empty}>
          {t("create_order_page.address.no_saved")}
        </Text>
      ) : (
        <View style={styles.list}>
          {addresses.map((address, index) => {
            const isSelected =
              address?.town === location?.town &&
              address?.fullAddress === location?.fullAddress;

            return (
              <TouchableOpacity
                key={`${address?.town}-${address?.fullAddress}-${index}`}
                activeOpacity={0.8}
                onPress={() => select(address)}
              >
                <View style={[styles.item, isSelected && styles.itemSelected]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.town} numberOfLines={1}>
                      {address?.town}
                    </Text>
                    <Text style={styles.address} numberOfLines={2}>
                      {address?.fullAddress}
                    </Text>
                  </View>

                  {isSelected && <Text style={styles.check}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <SheetButton onPress={addNew}>
        {t("create_order_page.address.add_new")}
      </SheetButton>
    </BottomSheet>
  );
};

export default AddressPickerSheet;
