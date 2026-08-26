import { StyleSheet, Text, View } from "react-native";
import InputWithValidation from "../../../Inputs/InputWithValidation";
import {
  validateFullAddress,
  validatePhoneNumber,
  validatePhoneNumberOmitEmpty,
  validateTown,
} from "../../../../shared/validation/validators/order/order-validator";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  block: { gap: 8 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  // The input carries its own 18px top margin for the floating label; the
  // prefix has to follow it or it hangs above the field
  prefix: { fontWeight: "bold", fontSize: 17, color: "#111", marginTop: 18 },
});

// The checkout screen groups its fields into cards now, so the inputs are
// rendered per section instead of as one block. No `section` = everything,
// which keeps the old call sites working.
const CreateOrderInputs = ({
  section,
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

  const shows = (name) => !section || section === name;

  return (
    <View style={styles.block}>
      {shows("address") && (
        <>
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
            label={t(
              "create_order_page.additional_data.inputs.full_address.label",
            )}
            keyboardType={"default"}
            validators={[validateFullAddress]}
            validatedOutside={validatedOutside}
          />
        </>
      )}

      {shows("phones") && (
        <>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+373</Text>
            <View style={{ flex: 1 }}>
              <InputWithValidation
                disabled={true}
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

          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+373</Text>
            <View style={{ flex: 1 }}>
              <InputWithValidation
                value={secondPhoneNumber}
                setValue={setSecondPhoneNumber}
                label={t(
                  "create_order_page.additional_data.inputs.second_phone_number.label",
                )}
                keyboardType={"number-pad"}
                validatedOutside={validatedOutside}
                validators={[validatePhoneNumberOmitEmpty]}
              />
            </View>
          </View>
        </>
      )}

      {shows("comments") && (
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
      )}
    </View>
  );
};

export default CreateOrderInputs;
