import React from "react";
import InputWithLabel from "../../../components/Inputs/InputWithLabel";
import { useTranslation } from "react-i18next";
import PhoneNumberInput from "../../../components/Inputs/PhoneNumberInput";
import { validateCompayPhone } from "../../../validation/validateCompany";
import SelectWithLabel from "../../../components/Inputs/SelectWithLabel";
import { genders } from "../../../static-data/data";

const CourierProfileInputs = ({
  name,
  setName,
  phone,
  setPhone,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  location,
  setLocation,
  telegramUsername,
  setTelegramUsername
}) => {
  const { t } = useTranslation();

  const handleDateChange = (value) => {
    if(!value) return;
    setBirthDate(value)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <InputWithLabel
          wrapperStyle={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          label={t("courier.courier_profile_inputs.name.label")}
          labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
          value={name}
          setValue={setName}
          validators={[]}
        />
      </div>

      <div className="flex gap-4 items-center">
        <div className="ml-2 text-xs sm:text-base text-gray-500 font-medium justify-between">
          {t("courier.courier_profile_inputs.phone_number.label")}
        </div>
        <PhoneNumberInput
          value={phone}
          setValue={setPhone}
          validators={[validateCompayPhone]}
        />
      </div>
      <div className="w-full">
        <SelectWithLabel
          wrapperClass="flex items-center justify-between gap-4"
          label={t("courier.courier_profile_inputs.gender.label")}
          labelClassName={"text-sm sm:text-base text-gray-500 font-medium"}
          selectClassName={"text-xs sm:text-sm"}
          value={gender}
          setValue={setGender}
          values={[
            {
              text: t("gender.male"),
              value: genders.male,
            },
            {
              text: t("gender.female"),
              value: genders.female,
            },
          ]}
        />
      </div>
          <div className="w-full flex items-center justify-between">
            <div className=" ml-2 text-sm sm:text-base text-gray-500 font-medium">
          {t("courier.courier_profile_inputs.birth_date.label")}
            </div>
					<input
						className="border-gray-500 border-solid border-2 rounded p-1 text-2xs "
						type="date"
                        value={birthDate}
						onChange={(e) => handleDateChange(e.target.value)}
					/>
          </div>
      <div className="w-full">
        <InputWithLabel
          wrapperStyle={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          label={t("courier.courier_profile_inputs.location.label")}
          labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
          value={location}
          setValue={setLocation}
          validators={[]}
        />
      </div>
      <div className="w-full">
        <InputWithLabel
          wrapperStyle={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          label={t("courier.courier_profile_inputs.telegram.label")}
          labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
          value={telegramUsername}
          setValue={setTelegramUsername}
          validators={[]}
        />
      </div>
    </div>
  );
};

export default CourierProfileInputs;
