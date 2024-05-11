import { appErrors } from "../../errors/errors";

const respErrors = {
    "internal server error": appErrors.something_went_wrong,
    
    //login-registration
    "invalid credentials": appErrors.invalidCredentials,
    "company with the same email already exists": appErrors.companyWithTheSameEmailAlreadyExists,
    "company with the same name already exists": appErrors.companyWithTheSameNameAlreadyExists,

    //file uploading
    "bad document": appErrors.invalidFile,
    "invalid file extension": appErrors.invalidFileExtension,

    //limit exceeded
    "pub limit exceeded": appErrors.pubLimitExceeded,


    //validation
    "validation error": appErrors.validationError,
}

export const convertRespError = (error) => {
    return respErrors[error] ?? appErrors.unknown_error;
}