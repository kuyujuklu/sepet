import { StyleSheet } from "react-native";
export const inputStylesConstants = {
    errorText: "#B00020"
}

export const inputStyles = StyleSheet.create({
    constants: {
        errorText: "#B00020"
    },
    container: {

    },
    labelContainer: {
        position: 'absolute',
        paddingHorizontal: 8,
    },
    inputField: {
        padding: 10,
        borderRadius: 15,
        fontSize: 16,
        borderColor: "red"
    },
    label: {
        fontSize: 16,
    },
    error: {
        marginTop: 4,
        marginLeft: 12,
        fontSize: 12,
        color: inputStylesConstants.errorText,
    }
})