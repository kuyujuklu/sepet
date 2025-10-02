"use client"
import Select, { components } from 'react-select'
import style from "../sass/index.module.scss";
import { useTranslation } from 'react-i18next';
import { locations, select_location_options_ro, select_location_options_ru } from '../../static-data/data';
import { translateLocation } from '../../utils/location';
import { useState, useEffect } from 'react';

const ChooseLocation = ({ location, setLocation }) => {
  const { i18n } = useTranslation()

  const handleChange = (value) => {
    setLocation(value)
  }

  return (
    <div className={`${style.wrap} flex flex-col justify-center items-center mt-5 sm:mt-10 sm:mb-20 mb-4`}>
      {
        //CHOOSE GEOLOCATION
      }
      <div className="flex flex-col gap-5 w-full items-center">
        {!location &&
          <h1 className="font-medium text-xl sm:text-3xl text-gray-600 text-center">

            Выберите ваш город, чтобы увидеть доступные заведения

          </h1>
        }
        <div className="w-full" style={{ maxWidth: 400, position: "relative", zIndex: 200 }}>
          <Select
            menuPosition={"absolute"}
            value={{ value: location, label: translateLocation(location, "ru") }}
            onChange={(option) => handleChange(option.value)}
            options={select_location_options_ru}
            minMenuHeight={400}
            components={{
              Control,
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: "#323942",
                color: "white",
                width: "100%",
                borderRadius: "10px",
                boxShadow: "none",
                outline: "none",
                border: "none",
              }),
              singleValue: (base, state) => ({
                ...base,
                color: "#ccc"
              }),
              menu: (base, state) => ({
                ...base,
                borderRadius: "10px",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "rgb(17, 24, 39)" : "rgb(38, 40, 46)",
                color: "white"
              }),
              input: (base, state) => ({
                ...base,
                color: "white"
              }),
              placeholder: (base, state) => ({
                ...base,
                color: "white"
              }),
            }}

          />
        </div>
      </div>
    </div>
  );
};

const Control = ({ children, ...props }) => (
  <components.Control {...props}>
    <span className="ml-2">📌</span> {children}
  </components.Control>
);
const PlaceholderRu = ({ ...props }) => (
  <components.Placeholder{...props}>
    Выберите...
  </components.Placeholder>
);
const PlaceholderRo = ({ ...props }) => (
  <components.Placeholder{...props}>
    Selecta...
  </components.Placeholder>
);

export default ChooseLocation;
