"use client"


import inputStyle from "../../sass/custom/inputs.module.scss"

//validatory is an array of functions that return a string error is value is not valid
const Select = ({value, setValue, values, selectStyle, selectClassName, optionStyle, optionClassName}) => {
    const handleChange = (e) => {
        const value = e.target.value
        setValue(value)
    }

    return (
        <div>
            <select 
                className={`${inputStyle.select} ${selectClassName}}`}
                style={selectStyle}
                value={value}
                onChange={handleChange}
            >
                {values?.map((option, index) => (
                    <option className={optionClassName} style={optionStyle} key={index} value={option.value}>{option.text}</option>
                ))}
            </select>
        </div>
    )
}

export default Select