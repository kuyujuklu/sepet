import { Text, View } from "native-base";
import Input from "../../Inputs/Input";
import { authStyles } from "../auth.styles";
import { useTranslation } from "react-i18next";

const AuthenticationDataInputs = ({
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
}) => {
  const { t } = useTranslation();

  return (
    <View style={authStyles.dataInputsContainer}>
      <View minWidth={"100%"} flexDir={"row"} alignItems={"center"} gap="3">
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <Input
            value={phoneNumber}
            setValue={setPhoneNumber}
            label={t("auth.inputs.phone_number.label")}
            keyboardType={"numeric"}
          />
        </View>
      </View>

      <Input
        value={password}
        setValue={setPassword}
        label={t("auth.inputs.password.label")}
        secureTextEntry
      />
    </View>
  );
};

export default AuthenticationDataInputs;
