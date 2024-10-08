import { useEffect, useState } from "react";
import Input from "./Input";
import { useTranslation } from "react-i18next";

const InputWithValidation = ({
  value,
  setValue,
  label,
  keyboardType,
  validators,
  //is used to show validation errors if user, for example, tried to send wrong data, so input will be revalidated inside
  inputStyles,
  inputParams,
  validatedOutside,
  secureTextEntry,
  resetErrors,
  setResetErrors,
  disabled,
}) => {
  const {t} = useTranslation()
  const [error, setError] = useState(null);
  const [valueWasSet, setValueWasSet] = useState(false);

  useEffect(() => {
    if (validatedOutside) setValueWasSet(true);
  }, [validatedOutside]);

  useEffect(() => {
    if(!resetErrors) return;
    setValueWasSet(null)
    setError(null)
    setResetErrors(false)
  }, [resetErrors])

  useEffect(() => {
    if (!validators) return;
    if (validators.length === 0) return;

    const wasSetBefore = valueWasSet;

    if (value) setValueWasSet(true);

    if (!wasSetBefore && !value) return;

    for (const validator of validators) {
      const err = validator(value);
      if (err) {
        setError(t(err));
        return;
      }
    }

    setError(null);
  }, [value, valueWasSet, validators]);

  return (
    <Input
      disabled={disabled}
      value={value}
      setValue={setValue}
      label={label}
      secureTextEntry={secureTextEntry}
      errorValue={error}
      keyboardType={keyboardType}
      inputStyles={inputStyles}
      inputParams={inputParams}
    />
  );
};

export default InputWithValidation;
