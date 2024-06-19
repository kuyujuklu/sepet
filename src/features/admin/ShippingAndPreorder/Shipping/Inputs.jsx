import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import Map from "./Map";
import {
    useGetPreorderQuery,
    useSetPreorderMutation,
    useSetShippingAvailabilityMutation,
} from "@/api/pub/pub";
import { selectShipping } from "./shippingSlice";
import { useDispatch, useSelector } from "react-redux";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import {
    errorKeys,
    setReceivingError,
} from "../../../errorHandlers/errorHandlerSlice";
import TimeInput from "./TimeInput";
import { useTranslation } from "react-i18next";
import DeliveryPriceInput from "./DeliveryPriceInput";
import WorkHoursInput from "./WorkHoursInput";

const Inputs = ({ pub }) => {
    const { t } = useTranslation();
    const shipping = useSelector(selectShipping);

    const [shippingChecked, setShippingChecked] = useState(null);
    const [shippingAvailabilityChanged, setShippingAvailabilityChanged] =
        useState(false);
    const [setShippingAvailability] = useSetShippingAvailabilityMutation({
        fixedCacheKey: fixedCacheKeys.pubs.set_shipping_availability,
    });

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
                        {t(
                            "admin.admin_panel.shipping.shipping_map.checkmark_headline"
                        )}
                    </div>
                    <span className="font-medium text-lg">
                        {t(
                            "admin.admin_panel.shipping.shipping_map.checkmark_label"
                        )}
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
                                shipping_time_from={
                                    pub?.shipping?.shipping_time_from
                                }
                                shipping_time_to={
                                    pub?.shipping?.shipping_time_to
                                }
                                companyID={pub?.company_id}
                                pubID={pub?.id}
                            />
                        </div>
                        <hr className="border-gray-300 my-4" />
                        <div>
                            <WorkHoursInput
                                shipping_start={
                                    pub?.shipping?.shipping_work_start
                                }
                                shipping_end={pub?.shipping?.shipping_work_end}
                                companyID={pub?.company_id}
                                pubID={pub?.id}
                            />
                        </div>
                        <hr className="border-gray-300 my-4" />
                        {/* Delivery price input */}
                        <div>
                            <div className="font-medium text-lg">
                                {t(
                                    "admin.admin_panel.shipping.shipping_price.headline"
                                )}
                            </div>
                            <DeliveryPriceInput
                                companyID={pub?.company_id}
                                pubID={pub?.id}
                                deliveryPrice={pub?.shipping?.shipping_price}
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
