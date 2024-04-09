import { Button, Text, View } from "native-base";
import React from "react";
const Radio = ({ value, values, setValue }) => {
  return (
    <View flexDir={"row"} gap="4" justifyContent={"space-between"}>
      {values?.map((item) => (
        <Button
          key={item.value}
          onPress={() => {
            console.log("pressed");
            setValue(item.value);
          }}
          px="15"
          py="2"
          borderRadius={10}
          borderWidth={1}
          borderColor={item.value === value ? "transparent" : "emerald.600"}
          background={item.value === value ? "emerald.600" : "transparent"}
        >
          <Text color={item.value === value ? "white" : "emerald.600"}
          fontWeight={item.value === value ? "bold": "regular"}>
            {item.text}
          </Text>
        </Button>
      ))}
    </View>
  );
};

export default Radio;
