import { formatProdErrorMessage } from "@reduxjs/toolkit";
import { Hidden, Text, View } from "native-base";
import { useEffect, useRef, useState } from "react";
import { TextInput, TouchableWithoutFeedback } from "react-native";

const ValidationNumberInput = ({ value: outputValue, setValue: setOutputValue }) => {

    const [inputArray, setInputArray] = useState(["", "", "", "", "", ""])
    const [inputValue, setInputValue] = useState("") 

    const setValue = (value) => {
        if(value === "") {
            setInputValue("")
            setInputArray(["", "", "", "", "", ""])
        }

        if(!(+value)) {
            return
        }
        
        value = value.toString().slice(0,6)

        const newInputArray = value.toString().split("").slice(0, 6)
        
        
        for(let i = newInputArray.length; i < 6; i++) {
            newInputArray.push("")
        }

        if(value.length === 6) {
            setOutputValue(value)
        }
        
        setInputArray(newInputArray)
        setInputValue(value)
    }

    const inputRef= useRef(null)


    return (
    <View flexDir="row" alignItems="center" gap={2} justifyContent="center">
      {inputArray.map((item, index) => (
        <View
            height={7}
            borderBottomColor={"primary.600"}
            borderBottomWidth={3}
            width={10}
        >
            <Text
            style={{padding: 0, fontSize: 20, textAlign: "center" }}
            >{inputArray[index]}</Text>
        </View>

      ))}

        {/* <View style={{height: 0, width: 0, position: "absolute"}}> */}
            <TextInput ref={inputRef} value={inputValue} onChangeText={setValue} keyboardType="number-pad" style={{opacity: 0, position: "absolute"}}  />
        {/* </View> */}


      <TouchableWithoutFeedback onPress={() => {inputRef.current?.focus()}}>
        <View
          style={{
            height: "120%",
            width: "100%",
            position: "absolute",
          }}
        ></View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ValidationNumberInput;
