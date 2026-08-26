import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSavedAddresses } from "../../features/store/geolocation/geolocationSlice";

const STORAGE_KEY = "saved_addresses";

export const readSavedAddresses = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log("getting saved addresses error: ", e);
    return [];
  }
};

// Adds an address to the list the client picks from, keeps it in AsyncStorage
// and in the store. Deduplicated on town + address, because checkout now saves
// the address of every order and the same one would pile up otherwise.
export const appendSavedAddress = async (dispatch, address) => {
  if (!address?.town || !address?.fullAddress) return;

  const savedAddresses = await readSavedAddresses();

  const withoutDuplicate = savedAddresses.filter(
    (saved) =>
      saved?.town !== address.town || saved?.fullAddress !== address.fullAddress,
  );

  withoutDuplicate.push({
    town: address.town,
    fullAddress: address.fullAddress,
    lat: address.lat,
    lng: address.lng,
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withoutDuplicate));
  dispatch(setSavedAddresses({ addresses: withoutDuplicate }));
};
