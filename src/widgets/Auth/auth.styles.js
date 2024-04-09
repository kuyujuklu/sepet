import { StyleSheet } from "react-native";
import { inputStyles } from "../Inputs/inputs.styles";

export const authStyles = StyleSheet.create({
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 20,
    paddingBottom: 50,
    background: "rgb(105,191,201)",
    background: "linear-gradient(0deg, rgba(105,191,201,0.7) 0%, rgba(0,147,233,0.7) 100%)",
  },
  authHeadline: {
    fontSize: 20,
  },
  authFormContainer: {
    padding: 50,
    gap: 2,
    width: "100%",
    flex: 1,
    justifyContent: "center"
  },
  dataInputsContainer: {
    gap: 10,
  }
});
