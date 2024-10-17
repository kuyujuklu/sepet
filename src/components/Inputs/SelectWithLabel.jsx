"use client"
import React from 'react'
import Select from './Select'

const SelectWithLabel = ({ disabled, wrapperClass, labelStyle, label, labelClassName, value, setValue, values, selectStyle, selectClassName, optionStyle, optionClassName}) => {
  return (
    <div className={wrapperClass}>
        <div style={labelStyle} className={`ml-2 ${labelClassName}`}>{label}</div>
        <Select 
          disabled={disabled}
            values={values}
            value={value}
            setValue={setValue}
            selectStyle={selectStyle}
            selectClassName={selectClassName}
            optionStyle={optionStyle}
            optionClassName={optionClassName}
        />
    </div>
  )
}

export default SelectWithLabel