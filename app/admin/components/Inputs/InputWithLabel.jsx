"use client"
import React from 'react'
import Input from './Input'

const InputWithLabel = ({type, value, setValue, inputStyle, inputClassName, labelStyle, label, labelClassName, validators}) => {
  return (
    <div>
        <div style={labelStyle} className={`ml-2 ${labelClassName}`}>{label}</div>
        <Input 
            type={type}
            value={value} 
            setValue={setValue} 
            style={inputStyle} 
            validators={validators}
            className={inputClassName}
        />
    </div>
  )
}

export default InputWithLabel