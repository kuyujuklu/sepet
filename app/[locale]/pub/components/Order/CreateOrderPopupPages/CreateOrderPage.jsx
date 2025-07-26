import Textarea from "@/app/shared-components/Inputs/Textarea";
import { currencies, orderTypes } from "@/app/static-data/data";
import { selectDishes } from "@/app/[locale]/pub/store/basketSlice";
import { selectData } from "@/app/[locale]/pub/store/pubInfoSlice";
import { Button } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const CreateOrderPage = ({
  comments,
  setComments,
  createOrder,
  deliveryPrice,
  productPrice,
  orderType,
  isDeliveryAvailable
}) => {
  const { t } = useTranslation();

  const pub = useSelector(selectData)?.pub;

  const currency =
    currencies.find((currency) => currency.id === pub?.currency_id)
      ?.symbol ?? "Lei";

  // const totalPrice = productPrice;


  return (
    <div className="flex justify-center flex-col gap-y-5 w-full">
      {isDeliveryAvailable &&
        <>
          <div>
            {!isNaN(deliveryPrice) ? (
              <>
                {orderType === orderTypes.delivery &&
                  <div>
                    <span className="text-xl font-medium">
                      {t("client.popups.create_order.delivery_price")}
          :
          </span>{" "}
                    <span className="font-bold text-lg">
                      {deliveryPrice} Lei
          </span>
                  </div>
                }
                <div>
                  <span className="text-xl font-medium">
                    {t("client.popups.create_order.product_price")}:
        </span>{" "}
                  <span className="font-bold text-lg">
                    {productPrice} Lei
        </span>
                </div>
              </>
            ) : (
                <></>
              )}
            {/* <div>
          <span className="text-xl font-medium">
          {t("client.popups.create_order.final_price")}:
          </span>{" "}
          <span className="font-bold text-lg">
          {totalPrice} {currency}
          </span>
          </div> */}
          </div>
          <div>
            <div
              className="text-xs sm:text-base text-gray-500 font-medium px-2"
              stlye={{ marginBottom: ".1rem" }}
            >
              {t("client.popups.create_order.comments")}
            </div>
            <Textarea
              style={{ fontSize: "1rem" }}
              value={comments}
              setValue={setComments}
            />
          </div>
        </>
      }
      <Button
        variant="contained"
        disabled={!isDeliveryAvailable}
        style={{
          width: "100%",
          color: "white",
          fontSize: ".7rem",
          fontWeight: "medium",
          padding: ".7rem 1rem",
          borderRadius: "10px",
          backgroundColor: "rgb(17 24 39)",
          background: "rgb(17 24 39)",
        }}
        sx={{
          bgcolor: "rgb(17, 24, 39)",
        }}
        onClick={createOrder}
      >
        {t("client.popups.create_order.create_order_button")}
      </Button>
    </div>
  );
};

export default CreateOrderPage;
