import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext } from "react";
import { ThemeContext } from "../PubPage/PubPage";
import Image from "next/image";
import Link from "next/link";
import BasketCount from "./BasketCount";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { openCreateOrderPopup } from "../../store/orderSlice";
import { useTranslation } from "react-i18next";
import SwitchLang from "./SwitchLang";
import { selectDishes } from "../../store/basketSlice";

const DownPanel = ({ reference, pubID }) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch()
    const {t} = useTranslation()
    const selectedDishes = useSelector(selectDishes);
    const count = Object.keys(selectedDishes)
        .reduce((acc, id) => (acc += selectedDishes[id].count ?? 0), 0);

    return (
        <div
            className={downPanelStyle.wrapper}
            ref={reference}
            style={{
                color: themeContext.textColor,
            }}
        >
            <div className={downPanelStyle.content}>
                <div
                    className="flex flex-col gap-2 pt-4"
                    style={{ minWidth: 320, width: "100%" }}
                >
                    <div className="relative">
                        <div className="relative">
                            
                            <div className="w-full px-5 left-0 right-0 mx-auto bottom-0 flex items-center justify-center">
                                <Button
                                    variant="contained"
                                    disabled={!count}
                                    sx={{
                                        color: "white",
                                        bgcolor: "rgb(31 41 55)",
                                        fontSize: ".7rem",
                                        fontWeight: "medium",
                                        padding: ".7rem 1rem",
                                        borderRadius: "10px",
                                        width: "100%",
                                        ":disabled": {
                                            color: "rgb(31, 41, 55)"
                                        },
                                        ":hover": {
                                            bgcolor: "rgb(17 24 39)",
                                        },
                                    }}
                                    onClick={() => dispatch(openCreateOrderPopup())}
                                >
                                    {t("client.basket.create_order_button")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex justify-evenly items-center w-full p-2"
                        style={{
                            background: themeContext.bgColor,
                        }}
                    >
                        <Link href={`/pub/${pubID}/`}>
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
                        <Link href={`/pub/${pubID}/basket`}>
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
                        <div className="flex flex-col justify-center items-center">
                            <SwitchLang />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.forwardRef((props, ref) => (
    <DownPanel {...props} reference={ref} />
));
