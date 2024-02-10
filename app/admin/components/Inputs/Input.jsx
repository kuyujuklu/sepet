"use client"


import { useEffect, useState } from "react"

import inputStyle from "../../sass/custom/inputs.module.scss"
import errorStyle from "../../sass/custom/errors.module.scss"
import { useTranslation } from "react-i18next"

//validators is an array of functions that return a string error is value is not valid
//validationDependencies is an array of values from what depends validation(example: for repeatPassword input it will be [password])
const Input = ({type, value, setValue, style, validators, validationDependencies}) => {
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


    const handleChange = (e) => {
        const value = e.target.value
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
            <input 
                type={type}
                className={`${inputStyle.input}`}
                style={style}
                value={value}
                onChange={handleChange}
            />
            {
                <div className={`${errorStyle.error} ${error && errorStyle.active}`}>
                    {t(error)}
                </div>
            }
        </div>
    )
}

export default Input