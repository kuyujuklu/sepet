import InputWithLabel from "@/app/shared-components/Inputs/InputWithLabel"
import PhoneNumberInput from "@/app/shared-components/Inputs/PhoneNumberInput"
import { validateFullAddress, validatePhone, validateTown } from "../validators"
import { useTranslation } from "react-i18next"

const AddressAndPhoneInputs = ({town, setTown, fullAddress, setFullAddress, phone, setPhone, isValidatedOutside}) => {
    const {t} = useTranslation()

  return (
    <div className="flex flex-col item-center gap-y-4">
    <InputWithLabel
        label={t("client.popups.create_order.town")}
        labelClassName={
            "text-xs sm:text-base text-gray-500 font-medium"
        }
        labelStyle={{
            marginBottom: ".1rem",
        }}
        inputStyle={{fontSize: "1rem"}}
        value={town}
        setValue={setTown}
        validators={[validateTown]}
        validationDependencies={{requireValidation: isValidatedOutside}}
    />
    <InputWithLabel
        label={t("client.popups.create_order.full_address")}
        labelClassName={
            "text-xs sm:text-base text-gray-500 font-medium"
        }
        labelStyle={{
            marginBottom: ".1rem",
        }}
        inputStyle={{fontSize: "1rem"}}
        value={fullAddress}
        setValue={setFullAddress}
        validators={[validateFullAddress]}
        validationDependencies={{requireValidation: isValidatedOutside}}
    />
    <div className="">
        <div className="text-xs sm:text-base text-gray-500 font-medium px-2" stlye={{ marginBottom: ".1rem"}}>
        {t("client.popups.create_order.phone")}
        </div>
        <PhoneNumberInput
            value={phone}
            setValue={setPhone}
            style={{fontSize: "1rem"}}
            
            validators={[validatePhone]}
            validationDependencies={{requireValidation: isValidatedOutside}}
        />
    </div>
    </div>
  )
}

export default AddressAndPhoneInputs