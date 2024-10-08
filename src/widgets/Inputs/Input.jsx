import {
  Animated,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { inputStyles, inputStylesConstants } from "./inputs.styles";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const Input = ({
  value,
  setValue,
  label,
  errorValue,
  keyboardType,
  inputStyles: inputStyleFromParams,
  secureTextEntry,
  inputParams,
  disabled,

  route,
}) => {
  const navigator = useNavigation();
  const [focusedAnimation] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const [isBluredPage, setIsBluredPage] = useState(false);
  useEffect(() => {
    const unsubscribeFocus = navigator.addListener("focus", () => {
      setIsBluredPage(false);
    });
    const unsubscribeBlur = navigator.addListener("blur", () => {
      setIsBluredPage(true);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigator, isFocused, errorValue, value]);

  let borderColor = errorValue
    ? inputStylesConstants.errorText
    : isFocused
      ? "#059669"
      : value
        ? "#aaa"
        : "#aaa";

  useEffect(() => {
    focusedAnimation.stopAnimation();
    Animated.timing(focusedAnimation, {
      toValue: isFocused || value || errorValue ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [isFocused, value]);

  return (
    <Animated.View style={{ marginTop: 18 }}>
      {/* INPUT */}
      <TextInput
        {...inputParams}
        ref={inputRef}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        editable={!disabled}
        style={{
          backgroundColor: "#fff",
          ...inputStyles.inputField,
          borderColor: borderColor,
          ...inputStyleFromParams,
        }}
        d
        // placeholderTextColor="#444"
      />

      {/* LABEL */}
      <TouchableWithoutFeedback
        onPress={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
        style={{ borderWidth: 1, borderColor: "#000", backgroundColor: "#000" }}
      >
        <Animated.View
          style={[
            inputStyles.labelContainer,
            {
              transform: isBluredPage
                ? [
                    {
                      scale: 1,
                    },
                    {
                      translateY: 12,
                    },
                    {
                      translateX: 16,
                    },
                  ]
                : [
                    {
                      scale: focusedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.75],
                      }),
                    },
                    {
                      translateY: focusedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, -30],
                      }),
                    },
                    {
                      translateX: focusedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, -16],
                      }),
                    },
                  ],
            },
          ]}
        >
          <Text
            style={[
              inputStyles.label,
              {
                color: borderColor,
              },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
      {errorValue && <Text style={inputStyles.error}>{errorValue}</Text>}
    </Animated.View>
  );
};

export default Input;
