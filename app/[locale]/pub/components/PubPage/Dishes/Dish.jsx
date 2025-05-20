import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../ThemeContextProvider";
import { currencies } from "@/app/static-data/data";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseDishAmount,
  increaseDishAmount,
  selectDish,
} from "@/app/[locale]/pub/store/basketSlice";
import BlackSpinner from "@/app/shared-components/loaders/BlackSpinner";
import { addCommissionToPrice } from "../../../../../utils/dish";
import { deliveryTypes } from "../../../../../static-data/data";
import { countCommissionForPub } from "../../../../../utils/pub";

const Dish = ({ pub, dish, currencyID }) => {
  const dispatch = useDispatch();

  const dishAmountFromState = useSelector(selectDish(dish?.id));
  const dishAmount = dishAmountFromState?.count ?? 0;
  const themeContext = useContext(ThemeContext);

  const handleIncreaseClick = () => {
    if (!dish.id) return;

    dispatch(increaseDishAmount({ dishID: dish.id }));
  };

  const handleDecreaseClick = () => {
    if (!dish.id) return;

    dispatch(decreaseDishAmount({ dishID: dish.id }));
  };

  const [imageIsLoaded, setImageIsLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => setImageIsLoaded(true), 5000)
  }, [])

  const currency = currencies.find(
    (currency) => currency.id === currencyID
  )?.symbol ?? "Lei"

  const smallestPrice =
    (dish?.sale_price !== 0) && dish?.sale_price < dish?.price
      ? dish?.sale_price
      : dish?.price;

  const commission = countCommissionForPub(pub)

  return (
    <div>
      {/* dish innter */}
      <div
        style={{
          height: "160px",
          width: "100%",
          border: "1px solid " + themeContext.textColor,
          background: "rgb(17 24 39)",
          color: dish.text_color ?? "#ffffff",
        }}
        className="rounded-2xl relative overflow-hidden"
      >
        {dish.image_file_name && (
          <img
            onLoad={() => setImageIsLoaded(true)}
            src={`/api-static/images/dishes/${dish.image_file_name}`}
            alt="dish"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}


        {/* category center content*/}
        <div
          style={{ zIndex: 20 }}
          className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
        >
          <div
            className="p-4 text-xl font-medium"
            style={{ textShadow: "0px 0px 3px black" }}
          >
            {dish.name}
            {
              dish.image_file_name && !imageIsLoaded && (<div className="w-full h-full flex pt-3 justify-center"><BlackSpinner /></div>)
            }
          </div>
        </div>
      </div>
      {/* dish price */}
      <div className="flex flex-col items-end justify-between px-4 py-2">
        <div className="text-right">
          <span className="text-gray-600 text-xl">
            {dish.ingredients}
          </span>
        </div>
        <div
          style={{ color: themeContext.textColor }}
          className="flex text-xl font-medium items-center gap-x-6"
        >
          <span>
            {
              <>
                {!!dish?.sale_price && dish?.sale_price < dish?.price && (
                  <span>
                    <strike className="mr-3 text-red-500">
                      {addCommissionToPrice(dish?.price, commission)}
                      {currency}
                    </strike>
                  </span>
                )}
                <span>{addCommissionToPrice(smallestPrice, commission)}</span>
              </>
            }{" "}
            <span>
              {currency}
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
              <div className="text-gray-600 flex items-center justify-center p-2 text-xl">
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
