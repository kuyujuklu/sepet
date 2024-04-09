import { Text, View } from "native-base";
import Input from "../../Inputs/Input";
import { authStyles } from "../auth.styles";

const RegistrationDataInputs = ({ phoneNumber, setPhoneNumber, name, setName }) => {

  return (
    <View style={authStyles.dataInputsContainer}>
      <Input value={name} setValue={setName} label={"Name"} />
      <View minWidth={"100%"} flexDir={"row"} alignItems={"center"} gap="3">
        <Text fontWeight={"bold"} fontSize={18} position={"relative"} top="6px">
          +373
        </Text>
        <View flex={1}>
          <Input 
            value={phoneNumber}
            setValue={setPhoneNumber}
            label={"Phone number"}
            keyboardType={"numeric"}
          />
        </View>
      </View>

    </View>
  );
};

export default RegistrationDataInputs;
