"use client"
import { Checkbox } from '@mui/material'
import React from 'react'

const CheckboxWithLabel = ({ value, setValue, label, labelStyle, labelClass, inputStyle, inputClass, useWrapperAsClickable }) => {
  return (
    <div className='flex'>
      <div style={labelStyle} className={`ml-2 ${labelClass}`} >{label}</div>
      <Checkbox
        checked={value}
        onChange={() => setValue(!value)}
        style={inputStyle}
        className={inputClass}
      />
    </div >
  )
}

export default CheckboxWithLabel
