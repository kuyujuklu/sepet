import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import Map from "./Map";
import { useSetShippingAvailabilityMutation } from "@/api/pub/pub";
import { selectShipping } from "./shippingSlice";
import { useSelector } from "react-redux";
import TimeInput from "./TimeInput";
import { useTranslation } from "react-i18next";
import DeliveryPriceInput from "./DeliveryPriceInput";
import WorkHoursInput from "./WorkHoursInput";
import PubCouriersInput from "./PubCouriersInput";
import DeliveryTypeInput from "./DeliveryTypeInput";
import { useSetAddCommissionToDishPricesMutation } from "../../../../api/pub/pub";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";
import BlackSpinner from "../../../../components/loaders/BlackSpinner";
import FreeDeliveryPriceInput from "./FreeDeliveryPriceInput";

const Inputs = ({ pub }) => {
  const { t } = useTranslation();
  const shipping = useSelector(selectShipping);

  const [shippingChecked, setShippingChecked] = useState(false);
  const [shippingAvailabilityChanged, setShippingAvailabilityChanged] =
    useState(false);
  const [setShippingAvailability] = useSetShippingAvailabilityMutation({
    fixedCacheKey: fixedCacheKeys.pubs.set_shipping_availability,
  });
  const [setAddCommission, { isLoading: isLoadingSetAddCommission }] =
    useSetAddCommissionToDishPricesMutation({
      fixedCacheKey: fixedCacheKeys.pubs.set_add_commission_to_dish_prices,
    });

  const saveAddCommission = (value) => {
    if (value === undefined || value === null || !pub?.company_id || !pub?.id)
      return;
    setAddCommission({
      companyID: pub?.company_id,
      pubID: pub?.id,
      addCommission: value,
    });
  };

  useEffect(() => {
    setShippingChecked(shipping.available);
  }, [shipping.available]);

  useEffect(() => {
    if (shippingChecked === null) return;
    if (!shippingAvailabilityChanged) return;

    setShippingAvailability({
      pubID: pub.id,
      companyID: pub.company_id,
      available: shippingChecked,
    });
  }, [pub.company_id, pub.id, setShippingAvailability, shippingChecked]);

  return (
    <div className="mt-4 mb-20">
      <div style={{ maxWidth: "750px" }} className="m-auto mb-10">
        <div>
          <div className="font-normal text-lg">
            {t("admin.admin_panel.shipping.shipping_map.checkmark_headline")}
          </div>
          <span className="font-medium text-lg">
            {t("admin.admin_panel.shipping.shipping_map.checkmark_label")}
          </span>
          <Checkbox
            checked={shippingChecked}
            onChange={() => {
              setShippingAvailabilityChanged(true);
              setShippingChecked(!shippingChecked);
            }}
          />
        </div>
        <hr className="border-gray-300 my-4" />
        {shippingChecked && (
          <>
            {/* Time input */}
            <div>
              <TimeInput
                shipping_time_from={pub?.shipping?.shipping_time_from}
                shipping_time_to={pub?.shipping?.shipping_time_to}
                companyID={pub?.company_id}
                pubID={pub?.id}
              />
            </div>
            <hr className="border-gray-300 my-4" />
            <div>
              <WorkHoursInput
                shipping_start={pub?.shipping?.shipping_work_start}
                shipping_end={pub?.shipping?.shipping_work_end}
                companyID={pub?.company_id}
                pubID={pub?.id}
              />
            </div>

            <hr className="border-gray-300 my-4" />
            <div className="flex items-center gap-10">
              <div className="font-medium text-lg">
                {t(
                  "admin.admin_panel.shipping.shipping_delivery_type.headline"
                )}
              </div>
              <DeliveryTypeInput
                companyID={pub?.company_id}
                pubID={pub?.id}
                deliveryType={pub?.shipping?.delivery_type}
              />
            </div>
            <hr className="border-gray-300 my-4" />
            <div className="flex items-center gap-10">
              <div className="font-medium text-lg">
                {t(
                  "admin.admin_panel.shipping.shipping_add_commission_to_dish_prices.headline"
                )}
              </div>
              {isLoadingSetAddCommission ? (
                <div style={{ height: 35 }} className="flex items-center justify-center">
                  <BlackSpinner />
                </div>
              ) : (
                <div style={{ height: 35 }} className="flex items-center justify-center">
                  <Checkbox
                    checked={pub?.shipping?.add_commission_to_dish_prices}
                    onChange={() =>
                      saveAddCommission(
                        !pub?.shipping?.add_commission_to_dish_prices
                      )
                    }
                  />
                </div>
              )}
            </div>

            {/* Not needed anymore */}
            {/* Couriers input
              <hr className="border-gray-300 my-4" />
              <div>
              <div className="font-medium text-lg mb-4">
                  {t("Your couriers")}
              </div>
            
              <PubCouriersInput
                pubID={pub?.id}
                companyID={pub?.company_id}
                couriers={pub?.couriers} 
                />
            </div> */}

            <hr className="border-gray-300 my-4" />

            {/* Delivery price input */}
            <div>
              <div className="font-medium text-lg mb-4">
                {t("admin.admin_panel.shipping.shipping_price.headline")}
              </div>
              <DeliveryPriceInput
                companyID={pub?.company_id}
                pubID={pub?.id}
                deliveryPrices={shipping?.shipping_prices}
                shapeColors={shipping?.shapes?.reduce((acc, shape) => {
                  acc[shape.shape_id] = shape.color;
                  return acc;
                }, {})}
              />
            </div>
            <div className="mt-2">
              <div className="font-medium text-lg mb-4">
                {t("admin.admin_panel.shipping.shipping_free_delivery_prices.headline")}
              </div>
              <FreeDeliveryPriceInput
                companyID={pub?.company_id}
                pubID={pub?.id}
                deliveryPrices={shipping?.shipping_free_delivery_prices}
                shapeColors={shipping?.shapes?.reduce((acc, shape) => {
                  acc[shape.shape_id] = shape.color;
                  return acc;
                }, {})}
              />
            </div>
          </>
        )}
      </div>

      {shippingChecked && <Map pub={pub} />}
    </div>
  );
};

export default Inputs;
