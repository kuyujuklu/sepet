"use client"
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import Popup from "@/app/shared-components/Popup/Popup";
import { selectSelectLocationPopupState, closeSelectLocationPopup, selectRequireLocation, setRequireLocation, openSelectLocationPopup, setLocation, selectLocation } from "../../store/locationSlice";
import Select, { components } from 'react-select'
import { locations, select_location_options_ro, select_location_options_ru } from "../../../../static-data/data";
import { translateLocation } from "../../../../utils/location";


const SelectLocationPopup = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectSelectLocationPopupState);
  const requireLocation = useSelector(selectRequireLocation)
  const location = useSelector(selectLocation)

  const closePopupIfSelected = useCallback(() => {
    if (!location || !locations[location]) {
      return;
    }
    dispatch(closeSelectLocationPopup())

  }, [dispatch, location])


  const handleChange = (option) => {
    console.log("value : ", option.value)
    if (!locations[option?.value]) {
      return;
    }

    dispatch(setLocation(option.value))
    dispatch(closeSelectLocationPopup())

  }

  useEffect(() => {
    if (requireLocation) {
      dispatch(openSelectLocationPopup())
      dispatch(setRequireLocation(false))
    }
  }, [dispatch, requireLocation])


  return (
    <Popup popupStyle={{ display: "block" }} contentStyle={{ top: 50, margin: "0 auto" }} opened={popupState.opened} closeCallback={closePopupIfSelected}>
      <div className="py-4">
        <header>
          <h1 className="font-bold text-center text-xl  mb-6">
            {t("client.popups.select_location_popup.headline")}
          </h1>
        </header>
        <main className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col gap-10">
            <div style={{}}>
              <Select
                menuPosition={"absolute"}
                onChange={handleChange}
                options={i18n.language === "ro" ? select_location_options_ro : select_location_options_ru}
                minMenuHeight={400}
                menuIsOpen={true}

                components={{
                  Control,
                  Placeholder: i18n.language === "ro" ? PlaceholderRo : PlaceholderRu
                }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "rgb(17, 24, 39)",
                    color: "white",
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
        </main>
      </div>
    </Popup>
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

export default SelectLocationPopup;
