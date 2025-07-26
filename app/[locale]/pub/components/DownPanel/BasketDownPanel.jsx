"use client"

import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext } from "react";
import { ThemeContext } from "../PubPage/ThemeContextProvider";
import Image from "next/image";
import Link from "next/link";
import BasketCount from "./BasketCount";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { openCreateOrderPopup } from "../../store/orderSlice";
import { useTranslation } from "react-i18next";
import { selectDishes } from "../../store/basketSlice";
import { selectData, selectIsPubInNearbyPubs } from "../../store/pubInfoSlice";
import { getPubWorkHours } from "../../../../utils/pub";

const DownPanel = ({ reference, pubID }) => {
  const themeContext = useContext(ThemeContext);
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const selectedDishes = useSelector(selectDishes);
  const count = Object.keys(selectedDishes)
    .reduce((acc, id) => (acc += selectedDishes[id].count ?? 0), 0);

  const pub = useSelector(selectData)?.pub

  const pubWorkHours = getPubWorkHours(pub)
  console.log("PUB WORK HOURS: ", pubWorkHours)
  const isDeliveryAvailable = pubWorkHours.isDeliveryAvailable
  console.log("IS DEL AV: ", isDeliveryAvailable)
  //const hasOrder = isDeliveryAvailable || pub?.has_in_place_order; Removed in place order 

  return (
    <div
      className={downPanelStyle.wrapper}
      ref={reference}
      style={{
        color: themeContext.textColor,
        background: "transparent"
      }}
    >
      <div style={{
        background: "transparent"
      }}
        className={downPanelStyle.content}>
        <div
          className="flex flex-col gap-2 pt-4"
          style={{ minWidth: 320, width: "100%" }}
        >
          <div className="relative">
            <div className="relative">

              <div style={{}} className="w-full flex-col px-5 left-0 right-0 mx-auto bottom-0 flex items-center justify-center">
                <Button
                  variant="contained"
                  disabled={!count || !isDeliveryAvailable}
                  style={{
                    background: "rgb(17 24 39)",
                  }}
                  sx={{
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".7rem 1rem",
                    borderRadius: "10px",
                    width: "100%",
                    color: "white",
                    bgcolor: "rgb(17 24 39)",
                  }}
                  onClick={() => dispatch(openCreateOrderPopup())}
                >
                  {t("client.basket.create_order_button")}
                </Button>
                {!isDeliveryAvailable &&
                  <div className="text-sm text-red-400">{t("client.basket.button_no_delivery_text")}</div>
                }
              </div>
            </div>
          </div>

          <div
            className="flex justify-evenly items-center w-full p-2"
            style={{
              background: themeContext.bgColor,
            }}
          >
            <Link href={`/`}>
              <div className="flex flex-col justify-center items-center">
                <Image
                  className="cursor-pointer"
                  src={
                    themeContext.theme === "dark"
                      ? "/images/svg/home-white.svg"
                      : "/images/svg/home-black.svg"
                  }
                  alt="pencil"
                  width={30}
                  height={30}
                />
              </div>
            </Link>
            <Link href={`/${i18n.language}/pub/${pubID}/`}>
              <div className="flex flex-col justify-center items-center">
                <Image
                  className="cursor-pointer"
                  src={
                    themeContext.theme === "dark"
                      ? "/images/svg/spoon-and-fork-white.svg"
                      : "/images/svg/spoon-and-fork-black.svg"
                  }
                  alt="pencil"
                  width={30}
                  height={30}
                />
              </div>
            </Link>
            <Link href={`/${i18n.language}/pub/${pubID}/basket`}>
              <div className="relative flex flex-col justify-center items-center">
                <Image
                  className="cursor-pointer"
                  src={
                    themeContext.theme === "dark"
                      ? "/images/svg/basket-white.svg"
                      : "/images/svg/basket-black.svg"
                  }
                  alt="pencil"
                  width={35}
                  height={35}
                />
                <span className="text-2xs">Basket</span>
                <BasketCount count={count} />
              </div>
            </Link>
            {/* <div className="flex flex-col justify-center items-center">
                            <SwitchLang />
                        </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef((props, ref) => (
  <DownPanel {...props} reference={ref} />
));
