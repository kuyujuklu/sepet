import { Button, Icon, Text, View, useColorModeValue } from "native-base";
import ValidationNumberInput from "./Inputs/ValidationNumberInput";
import { authStyles } from "./auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const AuthValidationNumber = ({
  goBack,
  canSendAgain,
  nextSessionTime,
  validationNumber,
  setValidationNumber,
  sendAgain,
}) => {
  const {t} = useTranslation()
  const buttonColor = useColorModeValue("blue.500", "blue.300");

  return (
    <View style={authStyles.dataInputsContainer}>
      <View alignItems="center">
        <Text fontSize={"lg"} fontWeight={"bold"}>
          {t("phone_validation_number_input.headline")}
        </Text>
      </View>

      <View>
        <ValidationNumberInput
          value={validationNumber}
          setValue={setValidationNumber}
        />
      </View>
      <View
        flexDir={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Button
          borderWidth={0}
          leftIcon={
            <Icon as={Ionicons} name="arrow-back" color={buttonColor} />
          }
          colorScheme="dark"
          variant="outline"
          onPress={goBack}
        >
          <Text color={buttonColor}>{t("phone_validation_number_input.go_back")}</Text>
        </Button>

        <Button
          borderWidth={0}
          colorScheme="dark"
          variant="outline"
          onPress={() => {
            if (canSendAgain) sendAgain();
          }}
        >
          <View flexDir="row" alignItems="center">
            {!canSendAgain && (
              <Text color={buttonColor}>
                {nextSessionTime ? nextSessionTime : "01:00"}{" "}
              </Text>
            )}
            <Text color={canSendAgain ? buttonColor : "coolGray.400"}>
              {t("phone_validation_number_input.send_again")}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );
};

export default AuthValidationNumber;
