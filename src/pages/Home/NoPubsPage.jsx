import { Image } from "expo-image";
import { Button, Text, View } from "native-base";
import React from "react";
import { images } from "../../app/images/images";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const NoPubsPage = () => {
  const { t } = useTranslation();
  const navigator = useNavigation()
  return (
    <View flex={1} justifyContent="space-around">
      <View px="5" pb="5">
        <Text
          fontWeight={"bold"}
          background={"#fff"}
          color="#111"
          fontSize={29}
        >
          {t("home_page.no_available_pubs_for_location")}
        </Text>
      </View>
      <View style={{ maxHeight: 400 }}>
        <Image
          style={{ width: "100%", height: "100%" }}
          source={images.MapAndCompass}
          contentFit="scale-down"
          alt="WTF"
        />
      </View>
      <TouchableOpacity onPress={() => navigator.navigate("SelectGeolocationPage")}>
        <View backgroundColor="emerald.600" px="10" py="3" mx="10" rounded="3xl">
        <Text  color="white" textAlign="center">
          {t("home_page.select_another_geolocation")}
        </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NoPubsPage;
