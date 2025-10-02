import { useDispatch, useSelector } from "react-redux";
import { useGetFullPubInfoQuery } from "../../../../api/pub/pub";
import {
  selectAddDishToOrderPopup,
  selectUpdateOrderApproximateTimePopup,
  setAddDishToOrderPopup,
  setUpdateOrderApproximateTimePopup,
} from "../ordersSlice";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useUpdateApproximatePreparationTimeMutation, useUpdateOrderDishesMutation } from "../../../../api/orders/orders";
import Popup from "../../../../components/Popup/Popup";
import { Button } from "@mui/material";
import WhiteSpinner from "../../../../components/loaders/WhiteSpinner";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";
import Input from "../../../../components/Inputs/Input";
import Select from "../../../../components/Inputs/Select.jsx"
import { ConvertQrMenuApiTimeToLocal, formatDate } from "../../../../utils/time";

const selectValues = [
  { text: "10 min", value: 10 },
  { text: "15 min", value: 15 },
  { text: "20 min", value: 20 },
  { text: "30 min", value: 30 },
  { text: "50 min", value: 50 },
]

const UpdateOrderApproximateTime = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectUpdateOrderApproximateTimePopup);


  const [
    updateTime,
    {
      data: updateOrderApproximateTimeData,
      error: updateOrderApproximateTimeDataError,
    },
  ] = useUpdateApproximatePreparationTimeMutation();

  const closePopup = useCallback(() => {
    dispatch(
      setUpdateOrderApproximateTimePopup({
        opened: false,
        pubID: null,
        companyID: null,
        orderID: null,
      })
    );
  }, [dispatch]);

  const [selectValue, setSelectValue] = useState(selectValues[0].value)

  useEffect(() => {
    if (updateOrderApproximateTimeData) {
      closePopup();
    }
  }, [closePopup, updateOrderApproximateTimeData]);

  const handleButtonClick = () => {
    const currentTime = new Date();
    const millisToAdd = selectValue * 60 * 1000;
    currentTime.setTime(currentTime.getTime() + millisToAdd);
    let time = formatDate(currentTime)

    let { pubID, companyID, orderID } = popupState

    if (!pubID || !companyID || !orderID) {
      return
    }

    updateTime({
      pubID,
      companyID,
      orderID,
      time,
    })
  };

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4 flex flex-col" style={{ maxHeight: "85vh" }}>
        <header>
          <h1 className="font-bold text-center text-xl mb-10 mr-20">
            {t("Заказ будет готов через: ")}
          </h1>
        </header>
        <main className="mb-10 flex flex-col gap-4 w-full justify-center items-center" style={{ flexBasis: "80%" }}>
          <div className="flex flex-col justify-center items-center gap-5 w-full ">
            <Select
              value={selectValue}
              setValue={setSelectValue}
              values={selectValues.map((value) => ({
                value: value.value,
                text: value.text,
              }))}
            />
            <Button
              variant="contained"
              sx={{
                color: "white",
                bgcolor: "#3b82f6",
                fontSize: ".7rem",
                fontWeight: "medium",
                padding: ".2rem 1rem",
                borderRadius: "10px",
                width: "fit-content%",
                ":hover": {
                  bgcolor: "#2563eb",
                },
              }}
              onClick={handleButtonClick}
            >
              <span>
                {t("Сохранить")}
              </span>
            </Button>
          </div>

        </main>
        <footer className="flex gap-10 justify-start text-center">
        </footer>
      </div>
    </Popup>
  );
};


export default UpdateOrderApproximateTime;
