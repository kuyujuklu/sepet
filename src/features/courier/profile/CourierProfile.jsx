import { useEffect, useMemo, useState } from "react";
import CourierProfileInputs from "./CourierProfileInputs";
import {
  useGetCourierQuery,
  useUpdateCourierMutation,
} from "../../../api/courier/courier";
import BlackSpinner from "../../../components/loaders/BlackSpinner";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { genders } from "../../../static-data/data";
import CourierProfileImage from "./CourierProfileImage";
import { useDispatch } from "react-redux";
import {
  errorKeys,
  setReceivingError,
} from "../../errorHandlers/errorHandlerSlice";
import { fixedCacheKeys } from "../../../api/fixedCacheKeys";

const CourierProfile = ({ courierID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [gender, setGender] = useState(genders.male);
  const [location, setLocation] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("")

  const {
    data: courierInfo,
    error: courierInfoError,
    isLoading: courierInfoIsLoading,
  } = useGetCourierQuery();

  //Check if is unauthorized
  useEffect(() => {
    if (!courierInfoError) return;
    dispatch(
      setReceivingError({
        errorKey: errorKeys.get_courier_info,
        error: courierInfoError,
      })
    );
  }, [courierInfoError, dispatch]);

  const localInputsHaveChanges = useMemo(() => {
    if (!courierInfo || !courierInfo.courier) return false;

    if (
      courierInfo.courier.full_name === name &&
      courierInfo.courier.phone_number === phone &&
      courierInfo.courier.birth_date === birthDate &&
      courierInfo.courier.gender === gender &&
      courierInfo.courier.location === location &&
      courierInfo.courier.telegram_username === telegramUsername
    ) {
      return false;
    }

    return true;
  }, [birthDate, courierInfo, gender, location, name, phone, telegramUsername]);

  const [lastCourierInfoFromApi, setLastCourierInfoFromApi] = useState(null);

  useEffect(() => {
    if (!courierInfo || !courierInfo.courier) return;

    const c = courierInfo.courier;

    if (c.full_name && c.full_name !== lastCourierInfoFromApi?.full_name) setName(c.full_name);
    if (c.phone_number && c.phone_number !== lastCourierInfoFromApi?.phone_number) setPhone(c.phone_number);
    if (c.gender && c.gender !== lastCourierInfoFromApi?.gender) setGender(c.gender);
    if (c.location && c.location !== lastCourierInfoFromApi?.location) setLocation(c.location);
    if (c.telegram_username && c.telegram_username !== lastCourierInfoFromApi?.telegram_username) setTelegramUsername(c.telegram_username);
    
    if (c.location && c.location !== lastCourierInfoFromApi?.location){
      if (c.birth_date === "0001-01-01") setBirthDate("2000-01-01");
      else setBirthDate(c.birth_date);
    }

    setLastCourierInfoFromApi(courierInfo.courier)
  }, [courierInfo, lastCourierInfoFromApi]);

  const [saveCourier, { isLoading: isSaveCourierLoading }] =
    useUpdateCourierMutation({
      fixedCacheKey: fixedCacheKeys.courier.update_courier_info,
    });

  const saveInputs = () => {
    const telegUser = telegramUsername.replace("@", "")
    const data = {
      fullName: name,
      phoneNumber: phone,
      gender: gender,
      birthDate: birthDate,
      location: location,
      telegramUsername: telegUser,
    };

    saveCourier({ courierID, data });
  };

  return (
    <div className="py-6 px-5 sm:px-16 rounded-xl shadow-2xl w-fit m-auto flex flex-col gap-10">
      <h1 className="text-center text-gray-800 text-xl font-bold">
        {t("courier.courier_profile_inputs.headline")}
      </h1>

      <div>
        <CourierProfileInputs
          name={name}
          setName={setName}
          phone={phone}
          setPhone={setPhone}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          gender={gender}
          setGender={setGender}
          location={location}
          setLocation={setLocation}
          telegramUsername={telegramUsername}
          setTelegramUsername={setTelegramUsername}
        />
        {localInputsHaveChanges && (
          <div className="w-full flex justify-end mt-3">
            <Button
              variant="contained"
              sx={{
                color: "white",
                bgcolor: "#3b82f6",
                fontSize: ".7rem",
                fontWeight: "medium",
                padding: ".5rem 1.5rem",
                borderRadius: "10px",
                width: "fit-content%",
                ":hover": {
                  bgcolor: "#2563eb",
                },
              }}
              onClick={saveInputs}
            >
              <span>
                {courierInfoIsLoading || isSaveCourierLoading ? (
                  <BlackSpinner />
                ) : (
                  t("admin.admin_panel.shipping.shipping_time.save")
                )}
              </span>
            </Button>
          </div>
        )}
      </div>

      <div className="m-auto w-fit mt">
        <CourierProfileImage
          courierID={courierID}
          courierImageFileName={courierInfo?.courier?.image_file_name}
        />
      </div>
    </div>
  );
};

export default CourierProfile;
