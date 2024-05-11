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

const Inputs = ({ pub }) => {
    const {t} = useTranslation()
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
        <div className="mt-4">
            <div style={{ maxWidth: "600px" }} className="m-auto mb-10">
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
                    <div className="font-normal text-lg">
                        {t("admin.admin_panel.shipping.shipping_map.checkmark_headline")}
                    </div>
                    <span className="font-medium text-lg">{t("admin.admin_panel.shipping.shipping_map.checkmark_label")}</span>
                    <Checkbox
                        checked={shippingChecked}
                        onChange={() => {
                            setShippingAvailabilityChanged(true);
                            setShippingChecked(!shippingChecked);
                        }}
                    />
                </div>
            </div>

            {shippingChecked && <Map pub={pub} />}
        </div>
    );
};

export default Inputs;
