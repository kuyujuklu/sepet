import { Text, View } from "native-base";
import Input from "../../Inputs/Input";
import { authStyles } from "../auth.styles";
import { useTranslation } from "react-i18next";
import InputWithValidation from "../../Inputs/InputWithValidation";
import { validatePhoneNumber } from "../../../shared/validation/validators/order/order-validator";

const ChangePasswordPhoneInput = ({
  phoneNumber,
  setPhoneNumber,
}) => {
  const { t } = useTranslation();

  return (
    <View style={authStyles.dataInputsContainer}>
      <View minWidth={"100%"} flexDir={"row"} alignItems={"center"} gap="3">
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <InputWithValidation
          validators={[validatePhoneNumber]}
            value={phoneNumber}
            setValue={setPhoneNumber}
            label={t("auth.inputs.phone_number.label")}
            keyboardType={"numeric"}
          />
        </View>
      </View>
    </View>
  );
};

export default ChangePasswordPhoneInput;
