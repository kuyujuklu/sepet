import Textarea from "@/app/shared-components/Inputs/Textarea";
import { currencies } from "@/app/static-data/data";
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
}) => {
    const { t } = useTranslation();
    const basket = useSelector(selectDishes);

    const dishes = useSelector(selectData)?.dishes;
    const pub = useSelector(selectData)?.pub;

    const currency =
        currencies.find((currency) => currency.id === pub?.currency_id)
            ?.symbol ?? "lei";

    const productPrice = useMemo(() => {
        if (!dishes) return;

        const dishIDs = Object.keys(basket);
        if (!dishIDs || dishIDs.length === 0)
            return "no dishes found in basket";

        const prices = {};

        dishes.forEach((dish) => {
            prices[dish.id] = dish.price;
            if (dish.sale_price && dish.sale_price < dish.price) {
                prices[dish.id] = dish.sale_price;
            }
        });

        let amount = 0;

        for (let dishID of dishIDs) {
            if (prices[dishID]) amount += prices[dishID] * basket[dishID].count;
            else return "unable to count price please reload page";
        }

        if (+deliveryPrice) amount += deliveryPrice;

        return amount;
    }, [basket, deliveryPrice, dishes]);

    const totalPrice = deliveryPrice + productPrice;

    return (
        <div className="flex justify-center flex-col gap-y-5 w-full">
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
            <div>
                {deliveryPrice ? (
                    <>
                        <div>
                            <span className="text-xl font-medium">
                                {t("client.popups.create_order.delivery_price")}
                                :
                            </span>{" "}
                            <span className="font-bold text-lg">
                                {deliveryPrice} Lei
                            </span>
                        </div>
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
                <div>
                    <span className="text-xl font-medium">
                        {t("client.popups.create_order.final_price")}:
                    </span>{" "}
                    <span className="font-bold text-lg">
                        {totalPrice} {currency}
                    </span>
                </div>
            </div>
            <Button
                variant="contained"
                style={{
                    width: "100%",
                    color: "white",
                    background: "rgb(17, 24, 39)",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".7rem 1rem",
                    borderRadius: "10px",
                }}
                sx={{

                    ":hover": {
                        bgcolor: "rgb(17 24 39)",
                    },
                }}
                onClick={createOrder}
            >
                {t("client.popups.create_order.create_order_button")}
            </Button>
        </div>
    );
};

export default CreateOrderPage;
