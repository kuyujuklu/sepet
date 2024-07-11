"use client";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../PubPage/ThemeContextProvider";
import BasketList from "./BasketList";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
    clearBasket,
    selectLastOrder,
    setBasketPubID,
} from "../../store/basketSlice";
import { useTranslation } from "next-i18next";
import LastOrder from "./LastOrder";

const BasketPage = ({ data }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);

    const lastOrder = useSelector(selectLastOrder);

    const handleClearClick = () => {
        dispatch(clearBasket());
    };

    useEffect(() => {
        if (!data || !data.pub) {
            return;
        }

        dispatch(setBasketPubID(data.pub.id));
    }, [data, dispatch]);

    return (
        <>
            {data?.pub && (
                <>
                    <div className="relative" style={{ minHeight: "100%" }}>
                        <div className="flex items-center mb-8 mt-2">
                            <h1
                                className="w-full block text-center text-2xl font-bold "
                                style={{ color: themeContext.textColor }}
                            >
                                {t("client.basket.headline")}
                            </h1>
                            <Image
                                className="cursor-pointer"
                                onClick={handleClearClick}
                                src={`/images/svg/trash-can-${
                                    themeContext.theme === "dark"
                                        ? "white"
                                        : "black"
                                }.svg`}
                                alt="add"
                                width={30}
                                height={30}
                            />
                        </div>
                        {lastOrder && lastOrder.pub_id === data.pub.real_id && (
                            <div className="mb-5">
                                <LastOrder
                                    order={lastOrder}
                                    currencyID={data.pub.currencyID}
                                />
                            </div>
                        )}
                        <BasketList
                            allDishes={data.dishes}
                            currencyID={data.pub.currencyID}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default BasketPage;
