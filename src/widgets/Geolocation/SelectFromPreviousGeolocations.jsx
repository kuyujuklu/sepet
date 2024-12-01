import { ScrollView, Text, View } from "native-base";
import { AnonymousProBold } from "../../constants/styles-constants";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSavedAddresses,
  setGeolocation,
  setNearGeolocation,
  setSavedAddresses,
} from "../../features/store/geolocation/geolocationSlice";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { images } from "../../app/images/images";
import { useMemo } from "react";

const SelectFromPreviousGeolocations = ({goToSelectGeolocationOnMap}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const savedAddressesFromSlice = useSelector(selectSavedAddresses);

  const savedAddresses = useMemo(() => {
    if (!savedAddressesFromSlice || savedAddressesFromSlice.length === 0)
      return [];
    if (savedAddressesFromSlice.length <= 3)
      return [...savedAddressesFromSlice];

    return savedAddressesFromSlice.slice(
      savedAddressesFromSlice.length - 3,
      savedAddressesFromSlice.length,
    );
  }, [savedAddressesFromSlice]);

  const selectGeolocation = ({ lat, lng, town, fullAddress }) => {
    dispatch(setGeolocation({ lat, lng, town, fullAddress }));
    dispatch(
      setNearGeolocation({
        lng,
        lat,
      }),
    );
    navigator.navigate("Home");
  };

  const removeWithIndex = async (index) => {
    const newAddresses = savedAddressesFromSlice
      ? [...savedAddressesFromSlice]
      : [];
    const indexInSavedAddressesFromSlice = savedAddressesFromSlice.length - 3 + index 
    newAddresses.splice(indexInSavedAddressesFromSlice, 1);
    AsyncStorage.setItem("saved_addresses", JSON.stringify(newAddresses));
    dispatch(setSavedAddresses({ addresses: newAddresses }));
  };

  // if (!savedAddresses || savedAddresses.length === 0) {
  //   return <></>;
  // }

  return (
    <View px={5} w="full" py="5">
      <View my="20" style={{
        width: 200,
         height: 200,
        margin: "auto"
  }}>
        <Image
          contentFit="contain"
          source={images.Sepet}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      {(savedAddresses && savedAddresses.length > 0) && 
        <Text fontSize={28} mb="5" fontWeight="bold" textAlign="center" fontFamily={AnonymousProBold}>
          {t("select_geolocation.saved_addresses")}
        </Text>
      }
      <View px={2} flexDirection="column" gap="10px" alignItems="center">
        {savedAddresses?.map((address, idx) => (
          <View
            w="full"
            justifyContent="space-between"
            flexDir="row"
            alignItems="center"
          >
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 50,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "#059669",
              }}
              onPress={() =>
                selectGeolocation({
                  lat: address.lat,
                  lng: address.lng,
                  town: address.town,
                  fullAddress: address.fullAddress,
                })
              }
            >
              <Text fontSize={15} color="white" ml='2' textAlign="left" numberOfLines={1}>
                {address.town + ", " + address.fullAddress}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeWithIndex(idx)}>
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  width: 30,
                  height: 30,
                }}
              >
                <Image
                  source={images.TrashRed}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </TouchableOpacity>
          </View>
        ))}
          <View
            w="full"
            justifyContent="space-between"
            flexDir="row"
            alignItems="center" 
            mt="5"
          >
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 50,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#059669",
                }}
                onPress={() =>
                  goToSelectGeolocationOnMap()
                }
              >
                <Text fontSize={14} color="white" textAlign="center" numberOfLines={1}>
                  + {t("select_geolocation.add_new_address")}
                </Text>
              </TouchableOpacity>
  
        </View>
      </View>
    </View>
  );
};

export default SelectFromPreviousGeolocations;
