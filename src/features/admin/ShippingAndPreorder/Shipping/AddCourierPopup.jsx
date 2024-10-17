import { useCallback, useEffect, useState } from "react";
import Popup from "../../../../components/Popup/Popup";
import {
  closeAddCourierPopup,
  selectAddCourierPopupState,
} from "./shippingSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useAddCourierMutation } from "../../../../api/pub/pub";
import { alertTypes, pushAlert } from "../../../alerts/alertSlice";
import { appErrors } from "../../../../errors/errors";
import InputWithLabel from "../../../../components/Inputs/InputWithLabel";
import { validators } from "../../../../validation/validators";
import { Button } from "@mui/material";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";
import WhiteSpinner from "../../../../components/loaders/WhiteSpinner";

const AddCourierPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const popupState = useSelector(selectAddCourierPopupState);

  const closePopup = useCallback(() => {
    dispatch(closeAddCourierPopup());
  }, [dispatch]);

  const [addCourierQuery, { data: addCourierData, isAddCourierLoading }] = useAddCourierMutation({
    fixedCacheKey: fixedCacheKeys.pubs.remove_courier_error,
  });

  useEffect(() => {
    if(!addCourierData) return;

    closePopup()
  }, [addCourierData, closePopup])

  const [courierID, setCourierID] = useState("");
  const setCourierIDValue = (value) => {
    if (isNaN(+value)) return;

    setCourierID(value);
  };

  const sendAddCourierQuery = () => {
    if (!popupState?.companyID || !popupState?.pubID) {
      dispatch(
        pushAlert({
          message: t(appErrors.something_went_wrong),
          type: "danger",
          delay: 3000,
        })
      );
    }

    if (isNaN(+courierID) || +courierID === 0) {
      dispatch(
        pushAlert({
          message: t(appErrors.courier.courier_id_is_invalid),
          type: alertTypes.warning,
          delay: 3000,
        })
      );
    }

    addCourierQuery({
      companyID: popupState.companyID,
      pubID: popupState.pubID,
      courierID: +courierID,
    });
  };

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4">
        <header className="mb-10">
          <h1 className="text-center text-gray-800 text-xl font-bold">
            {t("Add courier")}
          </h1>
        </header>
        <main className="flex flex-col gap-6 mb-6">
          <InputWithLabel
            wrapperStyle={{
              display: "flex",
              gap: "30px",
              justifyContent: "center",
              alignItems: "center",
            }}
            label={t("Courier ID")}
            labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
            inputStyle={{
              maxWidth: 80,
            }}
            value={courierID}
            setValue={setCourierIDValue}
            validators={[validators.ValidateNumber]}
          />
        </main>

        <footer className="text-center flex items-center justify-center">
          <Button
            disabled={!+courierID}
            variant="contained"
            sx={{
              color: "white",
              bgcolor: +courierID ? "#3b82f6" : "gray",
              fontSize: ".7rem",
              fontWeight: "medium",
              padding: ".2rem 1rem",
              borderRadius: "10px",
              width: "fit-content%",
              ":hover": {
                bgcolor: +courierID ? "#2563eb" : "gray",
              },
            }}
            onClick={sendAddCourierQuery}
          >
            {isAddCourierLoading ? (
              <WhiteSpinner />
            ) : (
              <span>{t("admin.popups.add_dish_to_order_popup.add_dish")}</span>
            )}
          </Button>
        </footer>
      </div>
    </Popup>
  );
};

export default AddCourierPopup;
