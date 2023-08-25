import { appErrors } from "../errors/errors";
import { validators } from "./validators";

export const ValidatePubName = (name) => {
    if(!name) {
        return "admin.validation_errors.pub.name.required";
    }

    if(validators.ValidateLength(name, 3, 255)) {
        switch(validators.ValidateLength(name, 3, 255)) {
            case appErrors.min:
                return "admin.validation_errors.pub.name.min";
            case appErrors.max:
                return "admin.validation_errors.pub.name.max";
        }
    }

    return null;
}

export const ValidatePub = (pub) => {
    let errors = [];
    let err = ValidatePubName(pub.name);
    if(err) {
        errors.push(err);
    }

    return errors;
}