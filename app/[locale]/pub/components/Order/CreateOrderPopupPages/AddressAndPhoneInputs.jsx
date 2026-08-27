import InputWithLabel from "@/app/shared-components/Inputs/InputWithLabel"
import PhoneNumberInput from "@/app/shared-components/Inputs/PhoneNumberInput"
import { validateFullAddress, validatePhone, validateTown } from "../validators"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { selectLocation, selectGeoCoords, openSelectLocationPopup } from "../../../store/locationSlice"
import { getLocationDisplayLabel } from "../../../../../utils/location"
import { closeCreateOrderPopup } from "../../../store/orderSlice"

const AddressAndPhoneInputs = ({ isDeliveryAvailable, town, setTown, fullAddress, setFullAddress, phone, setPhone, isValidatedOutside }) => {
  const { t, i18n } = useTranslation()

  const location = useSelector(selectLocation)
  const geoCoords = useSelector(selectGeoCoords)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!location) return;
    setTown(location)
  }, [location, setTown])

  const handleOpenLocationPopup = () => {
    dispatch(openSelectLocationPopup())
  }

  return (
    <div className="flex flex-col item-center gap-y-4">
      <div className="flex gap-2 items-center ml-2">
        <span className="text-xs sm:text-base text-gray-500 font-medium">
          {t("client.popups.create_order.delivery_to")}:
        </span>

        <div
          style={{
            cursor: "pointer",
            background: "rgb(17, 24, 39)",
            color: "white",
            padding: "5px 10px",
            width: "fit-content",
            borderRadius: 10,
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
          onClick={handleOpenLocationPopup}
        >
          {(location || geoCoords) ?
            <span>{getLocationDisplayLabel(location, geoCoords, i18n.language)}</span>
            :
            <span>{t("client.popups.create_order.choose")}</span>
          }
          <img
            // onLoad={() => setImageIsLoaded(true)}
            src={`/images/svg/arrow-bottom-white.svg`}
            alt="pub-cover"
            style={{
              display: "block",
              width: "15px",
              height: "15px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      {
        isDeliveryAvailable ?
          <>
            <InputWithLabel
              label={t("client.popups.create_order.full_address")}
              labelClassName={
                "text-xs sm:text-base text-gray-500 font-medium"
              }
              labelStyle={{
                marginBottom: ".1rem",
              }}
              inputStyle={{ fontSize: "1rem" }}
              value={fullAddress}
              setValue={setFullAddress}
              validators={[validateFullAddress]}
              validationDependencies={{ requireValidation: isValidatedOutside }}
            />
            <div className="">
              <div className="text-xs sm:text-base text-gray-500 font-medium px-2" stlye={{ marginBottom: ".1rem" }}>
                {t("client.popups.create_order.phone")}
              </div>
              <PhoneNumberInput
                value={phone}
                setValue={setPhone}
                style={{ fontSize: "1rem" }}

                validators={[validatePhone]}
                validationDependencies={{ requireValidation: isValidatedOutside }}
              />
            </div>
          </>

          : <div className="text-xl text-red-400 font-bold">{t("client.basket.no_delivery_available")}</div>
      }
    </div>
  )
}

export default AddressAndPhoneInputs
