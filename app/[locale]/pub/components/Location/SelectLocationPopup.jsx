"use client"
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import Popup from "@/app/shared-components/Popup/Popup";
import LocationPickerFields from "@/app/shared-components/LocationPicker/LocationPickerFields";
import {
  selectSelectLocationPopupState,
  closeSelectLocationPopup,
  selectRequireLocation,
  setRequireLocation,
  openSelectLocationPopup,
  setManualAddress,
  selectManualAddress,
  setGeoCoords,
  selectGeoCoords,
} from "../../store/locationSlice";
import { locations, latlng_for_location } from "../../../../static-data/data";

// Same picker as the landing page's ChooseLocation (LocationPickerFields) -
// this used to be a completely different, bare always-open react-select
// dropdown with no manual-address entry at all. Only the wrapper differs:
// a full popup here (this is reached mid-checkout, via an explicit "change
// address" action) instead of an inline dropdown panel.
const SelectLocationPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectSelectLocationPopupState);
  const requireLocation = useSelector(selectRequireLocation)
  const manualAddress = useSelector(selectManualAddress)
  const geoCoords = useSelector(selectGeoCoords)

  // Can't dismiss (backdrop click or the × button - Popup routes both
  // through this same callback) until some usable coordinate exists - this
  // popup can be forced open (see requireLocation below) when checkout
  // needs a location and none exists yet.
  const closePopupIfSelected = useCallback(() => {
    if (!geoCoords && !manualAddress?.town) {
      return;
    }
    dispatch(closeSelectLocationPopup())
  }, [dispatch, geoCoords, manualAddress])

  const handleSave = ({ town, street, coords }) => {
    dispatch(setManualAddress({ town, street }));
    dispatch(setGeoCoords(coords));
    dispatch(closeSelectLocationPopup());
  }

  useEffect(() => {
    if (requireLocation) {
      dispatch(openSelectLocationPopup())
      dispatch(setRequireLocation(false))
    }
  }, [dispatch, requireLocation])

  const seedTown = manualAddress?.town ?? ""
  const seedStreet = manualAddress?.street ?? ""
  const seedCoords = geoCoords ?? null
  const mapDefaultCenter = geoCoords ?? latlng_for_location[locations.Ceadir_Lunga]

  return (
    <Popup popupStyle={{ display: "block" }} contentStyle={{ top: 50, margin: "0 auto" }} opened={popupState.opened} closeCallback={closePopupIfSelected}>
      <div className="py-4">
        <header>
          <h1 className="font-bold text-center text-xl mb-6" style={{ color: "#1c2733" }}>
            {t("client.popups.select_location_popup.headline")}
          </h1>
        </header>
        <main className="mb-2">
          <LocationPickerFields
            key={String(popupState.opened)}
            initialTown={seedTown}
            initialStreet={seedStreet}
            initialCoords={seedCoords}
            mapDefaultCenter={mapDefaultCenter}
            onSave={handleSave}
          />
        </main>
      </div>
    </Popup>
  );
};

export default SelectLocationPopup;
