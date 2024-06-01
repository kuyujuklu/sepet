"use client"

import { useEffect, useState } from "react"

import inputStyle from "@/app/shared-components/sass/custom/inputs.module.scss"
import errorStyle from "@/app/shared-components/sass/custom/errors.module.scss"
import { useTranslation } from "react-i18next"
import PhoneInput from "react-phone-input-2"

//validatory is an array of functions that return a string error is value is not valid
const PhoneNumberInput = ({value, setValue, style, validators, validationDependencies}) => {
    const {t} = useTranslation()
    const [error, setError] = useState("")
    const depsStr = JSON.stringify(validationDependencies)

    useEffect(() => {
        let deps
        try{
            deps = JSON.parse(depsStr)
        } catch(e)
        {
            return
        }

        if(!deps) return
        if(!deps.requireValidation) return

        if(!validators || validators.length === 0) return
        for(let validator of validators) {
            const error = validator(value)
            if(error) {
                setError(error)
                return
            }
        }

    }, [depsStr, validators])

    const handleChange = (value) => {
        if(!validators || validators.length === 0) {
            setError("")
            setValue(value)
            return
        }
        
        for(let validator of validators) {
            const error = validator(value)
            if(error) {
                setValue(value)
                setError(error)
                return
            }
        }

        setValue(value)
        setError("")
    }

    return (
        <div>
            <PhoneInput 
                inputStyle={style}
                value={value}
                onChange={(e) => handleChange(e)}
                country={"md"}
                inputClass={`${inputStyle.input}`}
                specialLabel=""
                dropdownClass="hidden"
                dropdownStyle={{display: "none"}}
            />
            {
                <div className={`${errorStyle.error} ${error && errorStyle.active}`}>
                    {t(error)}
                </div>
            }
        </div>
    )
}

export default PhoneNumberInput