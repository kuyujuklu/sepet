export const appErrors = {
  something_went_wrong: "errors.something_went_wrong",
  unknown_error: "errors.unknown_error",
  unauthorized: "errors.unauthorized",

  //login
  client_with_the_same_phone_already_exists:
    "errors.client_with_the_same_phone_already_exists",
  client_not_found: "errors.client_not_found",
  invalidPassword: "errors.invalid_password",

  // SMS/OTP provider down or out of quota (backend: smserrors.ErrUnableToSendSms) -
  // used to fall through to unknown_error, which reads to the client like our own
  // bug rather than "try again in a bit".
  smsServiceUnavailable: "errors.sms_service_unavailable",

  //validation
  validationError: "errors.validation_error",
  fieldIsRequired: "errors.field_is_required",
  invalidEmail: "errors.invalid_email",
  passwordsAreNotEqual: "errors.passwords_are_not_equal",
  invalidPhone: "errors.invalid_phone",
  min: "errors.min",
  max: "errors.max",
  fieldMustBeNumber: "errors.field_must_be_number",
  invalidUrlName: "errors.invalid_url_name",
  too_many_sessions: "errors.too_many_sessions",
  invalid_session_validation_number: "errors.invalid_session_validation_number",

  //orders
  orderBelowMinimum: "errors.order_below_minimum",

  //file uploading
  fileIsTooLarge: "errors.file_is_too_large",
  invalidFileExtension: "errors.invalid_file_extension",
  fileIsNotAnImage: "errors.file_is_not_an_image",
  invalidFile: "errors.invalid_file",
};
