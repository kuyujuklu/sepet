import { Text, View } from "native-base";
import InputWithValidation from "../../../Inputs/InputWithValidation";
import { validateFullAddress, validatePhoneNumber, validateTown } from "../../../../shared/validation/validators/order/order-validator";
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
  validatedOutside
}) => {
  return (
    <View gap="2">
      <InputWithValidation
        value={town}
        setValue={setTown}
        label={"Town"}
        keyboardType={"default"}
        validators={[validateTown]}
        validatedOutside={validatedOutside}
      />
      <InputWithValidation
        value={fullAddress}
        setValue={setFullAddress}
        label={"Full address"}
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
            label={"Main phone number"}
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
            label={"Additional phone number"}
            keyboardType={"number-pad"}
            validatedOutside={validatedOutside}
            />
        </View>
      </View>
      <InputWithValidation
        value={comments}
        setValue={setComments}
        label={"Comments to your order"}
        keyboardType={"default"}
        validators={[validateFullAddress]}
        validatedOutside={validatedOutside}
        inputParams={{
          multiline: true,
          numberOfLines: 4
        }}
        inputStyles={{
          textAlignVertical: "top"
        }}
      />
    </View>
  );
};

export default CreateOrderInputs;
