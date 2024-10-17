import { useDispatch, useSelector } from "react-redux";
import Popup from "../../../components/Popup/Popup";
import {
  closeCourierInfoPopup,
  selectCourierInfoPopupState,
} from "./courierInfoPopupSlice";
import { useCallback } from "react";
import InputWithLabel from "../../../components/Inputs/InputWithLabel";
import PhoneNumberInput from "../../../components/Inputs/PhoneNumberInput";
import SelectWithLabel from "../../../components/Inputs/SelectWithLabel";
import { useTranslation } from "react-i18next";
import { genders } from "../../../static-data/data";
import CourierProfileImage from "../profile/CourierProfileImage";

const CourierInfoPopup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const popupState = useSelector(selectCourierInfoPopupState);
  const courier = popupState.courier;

  const closePopup = useCallback(() => {
    dispatch(closeCourierInfoPopup());
  }, [dispatch]);

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4">
        <header className="mb-10">
          <h1 className="text-center text-gray-800 text-xl font-bold">
            {t("Courier data")}
          </h1>
        </header>
        <main className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <InputWithLabel
                wrapperStyle={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                label={t("Name")}
                labelClassName={
                  "text-xs sm:text-base text-gray-500 font-medium"
                }
                value={courier?.full_name}
                validators={[]}
                disabled={true}
              />
            </div>

            <div className="flex gap-4 items-center justify-between">
              <div className="ml-2 text-xs sm:text-base text-gray-500 font-medium justify-between">
                {t("Phone number")}
              </div>
              <PhoneNumberInput value={courier?.phone_number} disabled />
            </div>
            <div className="w-full">
              <SelectWithLabel
                disabled
                wrapperClass="flex items-center justify-between gap-4"
                label={t("Gender")}
                labelClassName={
                  "text-sm sm:text-base text-gray-500 font-medium"
                }
                selectClassName={"text-xs sm:text-sm"}
                value={courier?.gender}
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
                {t("Birth date")}
              </div>
              <input
                className="border-gray-500 border-solid border-2 rounded p-1 text-2xs "
                type="date"
                value={courier?.birth_date}
                disabled
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
                label={t("Location")}
                labelClassName={
                  "text-xs sm:text-base text-gray-500 font-medium"
                }
                value={courier?.location}
                disabled
              />
            </div>
          </div>
        </main>

        <footer className="text-center flex items-center justify-center">
          <CourierProfileImage courierID={courier?.id} courierImageFileName={courier?.image_file_name} withUploadButton={false}/>
        </footer>
      </div>
    </Popup>
  );
};

export default CourierInfoPopup;
