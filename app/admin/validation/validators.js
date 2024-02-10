import { appErrors } from "../errors/errors";

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const validators = {
    NotEmpty(value) {
        if (value === "") {
            return appErrors.fieldIsRequired
        }
        return null
    },
    ValidateUrlName(value) {
        if(!value) {
            return appErrors.fieldIsRequired
        }
        if(!/^[a-z0-9-]+$/.test(value)) {
            return appErrors.invalidUrlName
        }
        return null
    },
    ValidateEmail (value) {
        value = value.trim();
        if(!emailRegex.test(value))
            return appErrors.invalidEmail
        return null 
    },
    ValidateLength(value, min = 0, max = Infinity) {
        if(value.length < min) {
            return appErrors.min
        }
    if(value.length > max) {
            return appErrors.max
        }
        return null
    },
    ValidateNumber(value) {
        if(!value || isNaN(value))
            return appErrors.fieldMustBeNumber
        return null 
    },
    ValidatePhone(value) {
        value = value.replace(/\s/g, '').replace(/-/g, '').replace(/'+/g, '')
        let err = this.ValidateNumber(value)
        if (err) return appErrors.invalidPhone
        if(value.length < 7) {
            return  appErrors.invalidPhone
        }
        return null 
    },
}