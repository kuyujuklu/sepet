import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "native-base";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableOpacity } from "react-native";

const SwitchLanguage = () => {
  const { i18n } = useTranslation();

  const handleChangeLang = async (lang) => {
    try {
      AsyncStorage.setItem('lang', lang)
    } catch (e) {
      console.log("setting language error");
    }
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <View flexDir="row" gap={5}>
        <TouchableOpacity onPress={() => handleChangeLang("ro")}>
          <View
            style={{
              backgroundColor:
                i18n.language === "ro" ? "#059669" : "transparent",
              borderWidth: 1,
              borderColor: "#059669",
            }}
            rounded={18}
            py={2}
            px={5}
          >
            <Text color={i18n.language === "ro" ? "white" : "emerald.600"}>
              RO
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChangeLang("ru")}>
          <View
            style={{
              backgroundColor:
                i18n.language === "ru" ? "#059669" : "transparent",
              borderWidth: 1,
              borderColor: "#059669",
            }}
            rounded={18}
            py={2}
            px={5}
          >
            <Text color={i18n.language === "ru" ? "white" : "emerald.600"}>
              RU
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChangeLang("gz")}>
          <View
            style={{
              backgroundColor:
                i18n.language === "gz" ? "#059669" : "transparent",
              borderWidth: 1,
              borderColor: "#059669",
            }}
            rounded={18}
            py={2}
            px={5}
          >
            <Text color={i18n.language === "gz" ? "white" : "emerald.600"}>
              GAG
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default memo(SwitchLanguage);
