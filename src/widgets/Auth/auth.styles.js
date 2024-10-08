import { StyleSheet } from "react-native";
import { inputStyles } from "../Inputs/inputs.styles";

export const authStyles = StyleSheet.create({
  authContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 50,
    background: "rgb(105,191,201)",
  },
  authHeadline: {
    fontSize: 20,
  },
  authFormContainer: {
    padding: 30,
    gap: 2,
    width: "100%",
    justifyContent: "flex-end",
  },
  dataInputsContainer: {
    width: "100%",
    gap: 10,
  },
});
