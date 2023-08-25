'use client'

import { useState } from "react"

import inputStyle from "../../sass/custom/inputs.module.scss"
import errorStyle from "../../sass/custom/errors.module.scss"
import { useTranslation } from "react-i18next"

//validatory is an array of functions that return a string error is value is not valid
const Input = ({type, value, setValue, style, validators}) => {
    const {t} = useTranslation()
    const [error, setError] = useState("")

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