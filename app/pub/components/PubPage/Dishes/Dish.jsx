import { useContext } from "react";
import { ThemeContext } from "../PubPage";
import { currencies } from "@/app/admin/static-data/data";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
    decreaseDishAmount,
    increaseDishAmount,
    selectDish,
} from "@/app/pub/store/basketSlice";

const Dish = ({ dish, currencyID }) => {
    const dispatch = useDispatch();

    const dishAmount = useSelector(selectDish(dish?.id));
    const themeContext = useContext(ThemeContext);

    const handleIncreaseClick = () => {
        if (!dish.id) return;

        dispatch(increaseDishAmount({ dishID: dish.id }));
    };

    const handleDecreaseClick = () => {
        if (!dish.id) return;

        dispatch(decreaseDishAmount({ dishID: dish.id }));
    };

    return (
        <div>
            {/* dish innter */}
            <div
                style={{
                    minHeight: "160px",
                    width: "100%",
                    border: "1px solid " + themeContext.textColor,
                    background: "rgb(17 24 39)",
                    color: dish.text_color ?? "#ffffff",
                }}
                className="rounded-2xl relative overflow-hidden"
            >
                {dish.image_file_name && (
                    <Image
                        src={`/api-static/images/dishes/${dish.image_file_name}`}
                        alt="dish"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                )}

                {/* category center content*/}
                <div
                    style={{ zIndex: 20 }}
                    className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
                >
                    <div className="p-4 text-xl font-medium">{dish.name}</div>
                </div>
            </div>
            {/* dish price */}
            <div className="flex items-center gap-2 justify-between px-4 py-2">
                <div>
                    <span className="text-gray-600 text-xl">
                        {dish.ingredients}
                    </span>
                </div>
                <div
                    style={{ color: themeContext.textColor }}
                    className="mt-2 text-xl font-medium flex items-center gap-6"
                >
                    <span>
                        {dish.price}{" "}
                        <span>
                            {currencies.find(
                                (currency) => currency.id === currencyID
                            )?.symbol ?? "Lei"}
                        </span>
                    </span>

                    <div className="flex items-center gap-2">
                        {dishAmount > 0 && (
                            <Image
                                onClick={handleDecreaseClick}
                                className="cursor-pointer"
                                src={
                                    themeContext.theme === "dark"
                                        ? "/images/svg/minus-in-circle-white.svg"
                                        : "/images/svg/minus-in-circle-black.svg"
                                }
                                alt="plus"
                                width={22}
                                height={22}
                            />
                        )}
                        {dishAmount > 0 && (
                            <div
                            
                                className="text-gray-600 flex items-center justify-center p-2 text-xl"
                            >
                                {dishAmount}
                            </div>
                        )}
                        <Image
                            onClick={handleIncreaseClick}
                            className="cursor-pointer"
                            src={
                                themeContext.theme === "dark"
                                    ? "/images/svg/plus-in-circle-white.svg"
                                    : "/images/svg/plus-in-circle-black.svg"
                            }
                            alt="plus"
                            width={22}
                            height={22}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dish;
