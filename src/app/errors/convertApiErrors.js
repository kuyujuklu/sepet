import { appErrors } from "./appErrors";

const respErrors = {
  "internal server error": appErrors.something_went_wrong,

  //file uploading
  "bad document": appErrors.invalidFile,
  "invalid file extension": appErrors.invalidFileExtension,

  //login
  invalid_validation_number: appErrors.invalid_validation_number,

  //validation
  "validation error": appErrors.validationError,

  "invalid password": appErrors.invalidPassword,
};

export const convertRespError = (error) => {
  return respErrors[error] ?? appErrors.unknown_error;
};
