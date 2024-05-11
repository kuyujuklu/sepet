import { appErrors } from "../../../../app/errors/appErrors";
import { clientValidationErrors } from "../../../../app/errors/validationErrors/client-validation-errors";
import { validatePhoneNumber } from "../order/order-validator";
import { validation } from "../validation-core";

const nameMinLength = 3;
const nameMaxLength = 100;

const passwordMinLength = 6;
const passwordMaxLength = 100;

export const validateClientName = (town) => {
  if (!town) {
    return clientValidationErrors.nameIsRequired;
  }

  const result = validation.ValidateLength(town, nameMinLength, nameMaxLength);
  switch (result) {
    case appErrors.min:
      return clientValidationErrors.nameMinLengthIs3;
    case appErrors.max:
      return clientValidationErrors.nameMaxLengthIs100;
  }

  return null;
};

export const validateClientPassword = (password) => {
  if (!password) {
    return clientValidationErrors.passwordIsRequired;
  }

  const result = validation.ValidateLength(
    password,
    passwordMinLength,
    passwordMaxLength,
  );
  switch (result) {
    case appErrors.min:
      return clientValidationErrors.passwordMinLengthIs6;
    case appErrors.max:
      return clientValidationErrors.passwordMaxLengthIs100;
  }

  return null;
};

export const validateRepeatPassword = (password, repeatPassword) => {
  return password !== repeatPassword ? appErrors.passwordsAreNotEqual : null;
};

export const validateRegistrationData = ({
  name,
  phone,
  password,
  repeatPassword,
}) => {
  return (
    validateClientName(name) ||
    validatePhoneNumber(phone) ||
    validateClientPassword(password) ||
    validateRepeatPassword(password, repeatPassword)
  );
};
