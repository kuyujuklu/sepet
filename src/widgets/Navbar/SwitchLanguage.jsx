import { Text, View } from "native-base";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableOpacity } from "react-native";

const SwitchLanguage = () => {
  const { i18n } = useTranslation();

  const handleChangeLang = async (lang) => {
    i18n.changeLanguage(lang);
  };
  return (
    <>
      <View flexDir="row" gap={5}>
        <TouchableOpacity onPress={() => handleChangeLang("ro")}>
          <View
            style={{
              backgroundColor:
                i18n.language === "ro" ? "rgb(31 41 55)" : "transparent",
              borderWidth: 1,
              borderColor: "rgb(31 41 55)",
            }}
            rounded={18}
            py={2}
            px={5}
          >
            <Text color={i18n.language === "ro" ? "white" : "black"}>RO</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChangeLang("ru")}>
          <View
            style={{
              backgroundColor:
                i18n.language === "ru" ? "rgb(31 41 55)" : "transparent",
              borderWidth: 1,
              borderColor: "rgb(31 41 55)",
            }}
            rounded={18}
            py={2}
            px={5}
          >
            <Text color={i18n.language === "ru" ? "white" : "black"}>RU</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default memo(SwitchLanguage);
