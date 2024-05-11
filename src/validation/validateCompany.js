import { appErrors } from "../errors/errors";
import { validators } from "./validators";

export const validateCompanyName = (name) => {
    if(!name) {
        return "admin.validation_errors.company.company_name.required";
    }
    if(validators.ValidateLength(name, 3, 255)) {
        switch(validators.ValidateLength(name, 3, 255)) {
            case appErrors.min:
                return "admin.validation_errors.company.company_name.min";
            case appErrors.max:
                return "admin.validation_errors.company.company_name.max";
        }
    }
    return null;
}

export const validateCompanyEmail = (email) => {
    if(!email) {
        return "admin.validation_errors.company.email.required";
    }
    if(validators.ValidateEmail(email)) {
        return "admin.validation_errors.company.email.invalid";
    }
    return null;
}

export const validateCompayPhone = (phone) => {
    if(!phone) {
        return "admin.validation_errors.company.phone.required";
    }
    if(validators.ValidatePhone(phone)) {
        return "admin.validation_errors.company.phone.invalid";
    }

    return null;
}

export const ValidatePassword = (password) => {
    if(!password) {
        return "admin.validation_errors.company.password.required";
    }

    if(validators.ValidateLength(password, 8, 255)) {
        switch(validators.ValidateLength(password, 8, 255)) {
            case appErrors.min:
                return "admin.validation_errors.company.password.min";
            case appErrors.max:
                return "admin.validation_errors.company.password.max";
        }
    }

    return null;
}

export const ValidateRepeatPassword = (repeatPassword, password) => {
    if(repeatPassword !== password) {
        return "admin.validation_errors.company.repeat_password.not_match";
    }

    return null;
}

export const ValidateCompany = (company) => {
    let errors = [];
    let err = validateCompanyName(company.name);
    if(err) {
        errors.push(err);
    }

    err = validateCompanyEmail(company.email);
    if(err) {
        errors.push(err);
    }

    err = validateCompayPhone(company.phone);
    if(err) {
        errors.push(err);
    }

    err = ValidatePassword(company.password);
    if(err) {
        errors.push(err);
    }

    return errors;
}