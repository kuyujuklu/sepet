import { appErrors } from "../../errors/errors";

const respErrors = {
    "internal server error": [appErrors.something_went_wrong],
}

export const convertRespError = (error) => {
    return respErrors[error] ?? appErrors.unknown_error;
}