export const appErrors = {
    something_went_wrong: "errors.something_went_wrong",
    unknown_error: "errors.unknown_error",
    unauthorized: "errors.unauthorized",

    //login
    too_many_session_requests: "errors.too_many_session_requests",
    client_with_the_same_phone_already_exists: "errors.client_with_the_same_phone_already_exists",
    invalid_validation_number: "errors.invalid_validation_number",
    client_not_found: "errors.client_not_found",
    validation_number_is_invalid_please_check_its_correctness: "errors.validation_number_is_invalid_please_check_its_correctness",

    //validation
    validationError: "errors.validation_error",
    fieldIsRequired: "errors.field_is_required",
    invalidEmail: "errors.invalid_email",
    invalidPhone: "errors.invalid_phone",
    min: "errors.min",
    max: "errors.max",
    fieldMustBeNumber: "errors.field_must_be_number",
    invalidUrlName: "errors.invalid_url_name",

    //file uploading
    fileIsTooLarge: "errors.file_is_too_large",
    invalidFileExtension: "errors.invalid_file_extension",
    fileIsNotAnImage: "errors.file_is_not_an_image",
    invalidFile: "errors.invalid_file",
}