import { useEffect, useState } from "react";
import Input from "./Input";

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

}) => {
  const [error, setError] = useState(null);
  const [valueWasSet, setValueWasSet] = useState(false);

  useEffect(() => {
    if(validatedOutside)
      setValueWasSet(true);
  }, [validatedOutside])

  useEffect(() => {
    if (!validators) return;
    if (validators.length === 0) return;

    const wasSetBefore = valueWasSet;

    if(value) setValueWasSet(true);

    if(!wasSetBefore && !value) return;

    for (let validator of validators) {
      const err = validator(value);
      if (err) {
        setError(err);
        return;
      }
    }

    setError(null);
  }, [value, valueWasSet]);

  return (
    <Input
      value={value}
      setValue={setValue}
      label={label}
      errorValue={error}
      keyboardType={keyboardType}
      inputStyles={inputStyles}
      inputParams={inputParams}
    />
  );
};

export default InputWithValidation;
