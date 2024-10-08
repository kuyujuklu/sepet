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

  "client not found": appErrors.client_not_found,

  "too many sessions": appErrors.too_many_sessions,
  "client with the same number already exists":
    appErrors.client_with_the_same_phone_already_exists,

  "invalid phone validation session number":
    appErrors.invalid_session_validation_number,
};

export const convertRespError = (error) => {
  return respErrors[error] ?? appErrors.unknown_error;
};
