import { Text, View } from "native-base";
import InputWithValidation from "../../../Inputs/InputWithValidation";
import {
  validateFullAddress,
  validatePhoneNumber,
  validateTown,
} from "../../../../shared/validation/validators/order/order-validator";
import { useTranslation } from "react-i18next";
const CreateOrderInputs = ({
  town,
  setTown,
  fullAddress,
  setFullAddress,
  phoneNumber,
  setPhoneNumber,
  secondPhoneNumber,
  setSecondPhoneNumber,
  comments,
  setComments,
  validatedOutside,
}) => {
  const { t } = useTranslation();
  return (
    <View gap="2">
      <InputWithValidation
        value={town}
        setValue={setTown}
        label={t("create_order_page.additional_data.inputs.town.label")}
        keyboardType={"default"}
        validators={[validateTown]}
        validatedOutside={validatedOutside}
      />
      <InputWithValidation
        value={fullAddress}
        setValue={setFullAddress}
        label={t("create_order_page.additional_data.inputs.full_address.label")}
        keyboardType={"default"}
        validators={[validateFullAddress]}
        validatedOutside={validatedOutside}
      />
      <View flexDir={"row"} alignItems={"center"} gap={4}>
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <InputWithValidation
            value={phoneNumber}
            setValue={setPhoneNumber}
            label={t(
              "create_order_page.additional_data.inputs.main_phone_number.label",
            )}
            keyboardType={"number-pad"}
            validators={[validatePhoneNumber]}
            validatedOutside={validatedOutside}
          />
        </View>
      </View>

      <View flexDir={"row"} alignItems={"center"} gap={4}>
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <InputWithValidation
            value={secondPhoneNumber}
            setValue={setSecondPhoneNumber}
            label={t(
              "create_order_page.additional_data.inputs.second_phone_number.label",
            )}
            keyboardType={"number-pad"}
            validatedOutside={validatedOutside}
          />
        </View>
      </View>
      <InputWithValidation
        value={comments}
        setValue={setComments}
        label={t("create_order_page.additional_data.inputs.comments.label")}
        keyboardType={"default"}
        validatedOutside={validatedOutside}
        inputParams={{
          multiline: true,
          numberOfLines: 4,
        }}
        inputStyles={{
          textAlignVertical: "top",
        }}
      />
    </View>
  );
};

export default CreateOrderInputs;
