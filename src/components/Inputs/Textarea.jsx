"use client"

import { useState } from "react"
import inputStyle from "../../sass/custom/inputs.module.scss"
import errorStyle from "../../sass/custom/errors.module.scss"
import { useTranslation } from "react-i18next"

const Textarea = ({value, setValue, style, className, validators}) => {
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
      <textarea
          value={value}
          onChange={handleChange}
          style={style}
          className={`${inputStyle.textarea} ${className}`}
      ></textarea>
      {
          <div className={`${errorStyle.error} ${error && errorStyle.active}`}>
              {t(error)}
          </div>
      }
    </div>
  )
}

export default Textarea