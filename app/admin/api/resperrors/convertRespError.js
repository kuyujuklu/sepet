import { appErrors } from "../../errors/errors";

const respErrors = {
    "internal server error": [appErrors.something_went_wrong],
}

export const convertRespError = (error) => {
    let err = respErrors[error];
    if(!err) {
        return appErrors.unknown_error;
    }
}