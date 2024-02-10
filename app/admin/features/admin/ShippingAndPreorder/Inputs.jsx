import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import Map from "./Shipping/Map";
import {
    useGetPreorderQuery,
    useSetPreorderMutation,
    useSetShippingAvailabilityMutation,
} from "@/app/admin/api/pub/pub";
import { selectShipping } from "./Shipping/shippingSlice";
import { useDispatch, useSelector } from "react-redux";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";
import {
    errorKeys,
    setReceivingError,
} from "../../errorHandlers/errorHandlerSlice";

const Inputs = ({ pub }) => {
    const dispatch = useDispatch();
    const shipping = useSelector(selectShipping);

    const { data: preorderData, error: preorderError } = useGetPreorderQuery({
        pubID: pub.id,
    });

    useEffect(() => {
        if (preorderError) {
            dispatch(
                setReceivingError({
                    errorKey: errorKeys.get_pub_preorder,
                    preorderError,
                })
            );
            return;
        }

        if (!preorderData) return;
        setPreorderChecked(
            preorderData.card_preorder || preorderData.cash_preorder
        );
        setPreorderWithCard(preorderData.card_preorder);
        setPreorderWithCash(preorderData.cash_preorder);
    }, [dispatch, preorderData, preorderError]);

    const [setPreorder, { isLoading }] = useSetPreorderMutation({
        fixedCacheKey: fixedCacheKeys.pubs.set_preorder,
    });

    useEffect(() => {
        if (isLoading) {
            setPreorderWithCard("idle");
            setPreorderWithCash("idle");
        }
    }, [isLoading]);

    const [preorderChecked, setPreorderChecked] = useState(false);
    const [preorderWithCash, setPreorderWithCash] = useState("idle");
    const [preorderWithCard, setPreorderWithCard] = useState("idle");

    useEffect(() => {
        if (!preorderData) return;

        if(preorderWithCard === "idle" || preorderWithCash === "idle") return;

        if (
            preorderData.card_preorder === preorderWithCard &&
            preorderData.cash_preorder === preorderWithCash
        )
            return;

        setPreorder({
            pubID: pub.id,
            companyID: pub.company_id,
            preorder: {
                cardPreorder: preorderWithCard,
                cashPreorder: preorderWithCash,
            },
        });
    }, [
        preorderData,
        preorderWithCard,
        preorderWithCash,
        pub.company_id,
        pub.id,
        setPreorder,
    ]);

    const [shippingChecked, setShippingChecked] = useState(false);

    const [setShippingAvailability] = useSetShippingAvailabilityMutation({
        fixedCacheKey: fixedCacheKeys.pubs.set_shipping_availability,
    });

    useEffect(() => {
        setShippingChecked(shipping.available);
    }, [shipping.available]);

    useEffect(() => {
        setShippingAvailability({
            pubID: pub.id,
            companyID: pub.company_id,
            available: shippingChecked,
        });
    }, [pub.company_id, pub.id, setShippingAvailability, shippingChecked]);

    return (
        <div className="mt-4">
            <div style={{ maxWidth: "600px" }} className="m-auto mb-10">
                <div>
                    <div className="font-normal text-lg">
                        If you wanna enable preordering for your pub put down
                        the checkmark
                    </div>
                    <span className="font-medium text-lg">Preorder</span>
                    <Checkbox
                        checked={preorderChecked}
                        onChange={() => setPreorderChecked(!preorderChecked)}
                    />
                </div>
                {preorderChecked && (
                    <div className="pl-4">
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-lg">
                                Оплата наличными{" "}
                            </span>
                                <Checkbox
                                    checked={preorderWithCash === "idle" ? false : preorderWithCash}
                                    onChange={() =>
                                        setPreorderWithCash(!preorderWithCash)
                                    }
                                    disabled={isLoading}
                                />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-lg">
                                Оплата онлайн{" "}
                            </span>
                                <Checkbox
                                    checked={preorderWithCard === "idle" ? false : preorderWithCard}
                                    onChange={() =>
                                        setPreorderWithCard(!preorderWithCard)
                                    }
                                    disabled={isLoading}
                                />
                        </div>
                    </div>
                )}
                <hr className="border-gray-300" />
                <div className="mt-4">
                    <div className="font-normal text-lg">
                        If your pub has shipping put down the checkmark
                    </div>
                    <span className="font-medium text-lg">Shipping</span>
                    <Checkbox
                        checked={shippingChecked}
                        onChange={() => setShippingChecked(!shippingChecked)}
                    />
                </div>
            </div>

            {shippingChecked && <Map pub={pub} />}
        </div>
    );
};

export default Inputs;
