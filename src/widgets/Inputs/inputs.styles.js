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
        // There was a borderColor but no borderWidth, so the field had no
        // outline at all - invisible as soon as it sits on a white card
        borderWidth: 1.5,
        borderRadius: 14,
        fontSize: 16,
        borderColor: "#d4d4d8"
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