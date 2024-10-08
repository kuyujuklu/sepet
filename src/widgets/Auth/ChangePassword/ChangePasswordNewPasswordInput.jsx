import { Text, View } from "native-base";
import Input from "../../Inputs/Input";
import { authStyles } from "../auth.styles";
import { useTranslation } from "react-i18next";
import InputWithValidation from "../../Inputs/InputWithValidation";
import { validateClientPassword } from "../../../shared/validation/validators/client/client-validation";

const ChangePasswordNewPasswordInput = ({
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
}) => {
  const { t } = useTranslation();

  return (
    <View style={authStyles.dataInputsContainer} >
       <View minWidth={"100%"} flexDir={"row"} alignItems={"center"} gap="3"></View>
      <InputWithValidation
        value={password}
        setValue={setPassword}
        secureTextEntry
        validators={[validateClientPassword]}
        label={t("change_password.inputs.new_password.label")}
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
        label={t("change_password.inputs.repeat_password.label")}
      />
    </View>
  );
};

export default ChangePasswordNewPasswordInput;
