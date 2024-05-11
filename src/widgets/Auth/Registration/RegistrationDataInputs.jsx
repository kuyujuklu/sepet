import { Text, View } from "native-base";
import { authStyles } from "../auth.styles";
import { useTranslation } from "react-i18next";
import InputWithValidation from "../../Inputs/InputWithValidation";
import { validatePhoneNumber } from "../../../shared/validation/validators/order/order-validator";
import { validateClientName, validateClientPassword } from "../../../shared/validation/validators/client/client-validation";

const RegistrationDataInputs = ({
  phoneNumber,
  setPhoneNumber,
  name,
  setName,
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
}) => {
  const { t } = useTranslation();
  return (
    <View style={authStyles.dataInputsContainer}>
      <InputWithValidation
        validators={[validateClientName]}
        value={name}
        setValue={setName}
        label={t("registration.inputs.name.label")}
      />
      <View minWidth={"100%"} flexDir={"row"} alignItems={"center"} gap="3">
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <InputWithValidation
            validators={[validatePhoneNumber]}
            value={phoneNumber}
            setValue={setPhoneNumber}
            label={t("registration.inputs.phone_number.label")}
            keyboardType={"numeric"}
          />
        </View>
      </View>

      <InputWithValidation
        value={password}
        setValue={setPassword}
        secureTextEntry
        validators={[validateClientPassword]}
        label={t("registration.inputs.password.label")}
      />

      <InputWithValidation
        value={repeatPassword}
        setValue={setRepeatPassword}
        secureTextEntry
        validators={[
          () =>
            password !== repeatPassword
              ? "errors.passwords_are_not_equal"
              : null,
        ]}
        label={t("registration.inputs.repeat_password.label")}
      />
    </View>
  );
};

export default RegistrationDataInputs;
