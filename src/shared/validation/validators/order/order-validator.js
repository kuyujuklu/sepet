import { appErrors } from "../../../../app/errors/appErrors";
import { validation } from "../validation-core";

const townMinLength = 3;
const townMaxLength = 100;
export const validateTown = (town) => {
  if (!town) {
    return appErrors.fieldIsRequired;
  }

  const result = validation.ValidateLength(town, townMinLength, townMaxLength);
  switch (result) {
    case appErrors.min:
      return `town min length is ${townMinLength}`;
    case appErrors.max:
      return `town max length is ${townMaxLength}`;
  }

  return null;
};

export const validateFullAddress = (fullAddress) => {
  if (!fullAddress) {
    return appErrors.fieldIsRequired;
  }

  const result = validation.ValidateLength(fullAddress, 10, 200);
  switch (result) {
    case appErrors.min:
      return `full address min length is 10`;
    case appErrors.max:
      return `full address max length is 200`;
  }

  return null;
};

export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return appErrors.fieldIsRequired;
  }

  const result = validation.ValidatePhone(phoneNumber);
  if (result) {
    return result;
  }

  return null;
};

export const validateOrder = (town, fullAddress, phoneNumber, secondPhone) => {
  const errorArray = [];

  const townError = validateTown(town);
  if (townError) {
    errorArray.push(townError);
  }

  const fullAddressError = validateFullAddress(fullAddress);
  if (fullAddressError) {
    errorArray.push(fullAddressError);
  }

  const phoneNumberError = validatePhoneNumber(phoneNumber);
  if (phoneNumberError) {
    errorArray.push(phoneNumberError);
  }

  if (secondPhone) {
    const secondPhoneError = validatePhoneNumber(secondPhone);
    if (secondPhoneError) {
      errorArray.push(secondPhoneError);
    }
  }

  return errorArray;
};
